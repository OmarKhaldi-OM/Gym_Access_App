package com.example.gym_app.access.service;

import com.example.gym_app.access.dto.AccessLogRequestDTO;
import com.example.gym_app.access.dto.FaceRecognitionResponseDTO;
import com.example.gym_app.access.entity.Face_Authentication;
import com.example.gym_app.access.entity.Access_Log;
import com.example.gym_app.access.entity.Face_Embedding;
import com.example.gym_app.access.entity.TypeAcces;
import com.example.gym_app.access.repository.AccessLogRepository;
import com.example.gym_app.access.repository.FaceAuthenticationRepository;
import com.example.gym_app.access.repository.FaceEmbeddingRepository;
import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.membership.service.SubscriptionService;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.User;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class FaceRecognitionService {

    // face_recognition compares embeddings by Euclidean distance, not a custom similarity score.
    // With the configured default threshold, a match requires a distance <= 0.60.
    private final float minAcceptedSimilarity;
    private final float minAccountMatchMargin;

    private final FaceEmbeddingRepository faceEmbeddingRepository;

    private final FaceAuthenticationRepository faceAuthenticationRepository;

    private final MemberRepository memberRepository;

    private final UserRepository userRepository;

    private final AccessLogRepository accessLogRepository;

    private final AccessLogService accessLogService;

    private final SubscriptionService subscriptionService;

    private final SecurityUtil securityUtil;

    private final String faceRecognitionUrl;
    private final String faceServiceKey;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().build();

    public FaceRecognitionService(
            FaceEmbeddingRepository faceEmbeddingRepository,
            FaceAuthenticationRepository faceAuthenticationRepository,
            MemberRepository memberRepository,
            UserRepository userRepository,
            AccessLogRepository accessLogRepository,
            AccessLogService accessLogService,
            SubscriptionService subscriptionService,
            SecurityUtil securityUtil,
            @Value("${app.face-recognition.url:http://127.0.0.1:8001}") String faceRecognitionUrl,
            @Value("${app.face-recognition.key:}") String faceServiceKey,
            @Value("${app.face-recognition.minimum-accepted-similarity}") float minAcceptedSimilarity,
            @Value("${app.face-recognition.minimum-account-match-margin}") float minAccountMatchMargin) {
        this.faceEmbeddingRepository = faceEmbeddingRepository;
        this.faceAuthenticationRepository = faceAuthenticationRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.accessLogRepository = accessLogRepository;
        this.accessLogService = accessLogService;
        this.subscriptionService = subscriptionService;
        this.securityUtil = securityUtil;
        this.faceRecognitionUrl = faceRecognitionUrl;
        this.faceServiceKey = faceServiceKey;
        this.minAcceptedSimilarity = minAcceptedSimilarity;
        this.minAccountMatchMargin = minAccountMatchMargin;
    }

    @Transactional
    public FaceRecognitionResponseDTO enrollAccountFace(String imageBase64) {
        securityUtil.requireRole(Role.MEMBER, Role.ADMIN, Role.RECEPTIONIST);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        float[] embedding = requestEmbedding(imageBase64);

        Face_Authentication credential = faceAuthenticationRepository.findByUserId(user.getId())
                .orElseGet(Face_Authentication::new);
        credential.setUser(user);
        credential.setVecteurFacial(toByteArray(embedding));
        credential.setDateEnregistrement(LocalDateTime.now());
        faceAuthenticationRepository.save(credential);

        FaceRecognitionResponseDTO response = new FaceRecognitionResponseDTO();
        response.setStatus("ENROLLED");
        response.setMessage("Face successfully enrolled for account sign-in.");
        response.setFaceDetected(Boolean.TRUE);
        return response;
    }

    @Transactional(readOnly = true)
    public Optional<RecognizedAccount> authenticateAccount(String imageBase64) {
        float[] sourceEmbedding = requestEmbedding(imageBase64);
        return findBestAccountMatch(
                sourceEmbedding,
                faceAuthenticationRepository.findAll(),
                faceEmbeddingRepository.findAll()
        ).map(user -> new RecognizedAccount(user.getEmail(), user.getRole()));
    }

    public FaceRecognitionResponseDTO enroll(UUID memberId, String imageBase64) {
        securityUtil.requireStaff();
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + memberId));

        float[] embedding = requestEmbedding(imageBase64);
        Face_Embedding faceEmbedding = new Face_Embedding();
        faceEmbedding.setMember(member);
        faceEmbedding.setVecteurFacial(toByteArray(embedding));
        faceEmbeddingRepository.save(faceEmbedding);

        FaceRecognitionResponseDTO response = new FaceRecognitionResponseDTO();
        response.setMemberId(memberId);
        response.setMemberNom(member.getNom() + " " + member.getPrenom());
        response.setConfidence(1.0F);
        response.setMatched(Boolean.TRUE);
        response.setAccessGranted(Boolean.FALSE);
        response.setAccessType(null);
        response.setStatus("ENROLLED");
        response.setMessage("Face successfully enrolled.");
        response.setFaceDetected(Boolean.TRUE);
        return response;
    }

    public FaceRecognitionResponseDTO recognize(String imageBase64, TypeAcces typeAcces) {
        securityUtil.requireStaff();
        float[] sourceEmbedding = requestEmbedding(imageBase64);
        MatchResult bestMatch = findBestMatch(sourceEmbedding);

        FaceRecognitionResponseDTO response = new FaceRecognitionResponseDTO();
        response.setAccessType(typeAcces.name());
        response.setFaceDetected(Boolean.TRUE);

        if (bestMatch == null) {
            response.setMemberId(null);
            response.setMemberNom(null);
            response.setConfidence(0F);
            response.setMatched(Boolean.FALSE);
            response.setAccessGranted(Boolean.FALSE);
            response.setStatus("DENIED");
            response.setMessage("No matching member found.");
            return response;
        }

        float similarity = bestMatch.similarity();
        response.setMemberId(bestMatch.memberId());
        response.setMemberNom(bestMatch.memberNom());
        response.setConfidence(roundToTwoDecimals(similarity));

        if (similarity < minAcceptedSimilarity) {
            response.setMatched(Boolean.FALSE);
            response.setAccessGranted(Boolean.FALSE);
            response.setStatus("DENIED");
            response.setMessage("Face detected but confidence is insufficient.");
            return response;
        }

        if (!subscriptionService.hasActiveSubscription(bestMatch.memberId())) {
            writeAccessLog(bestMatch.memberId(), typeAcces, "REFUSE", similarity);
            response.setMatched(Boolean.TRUE);
            response.setAccessGranted(Boolean.FALSE);
            response.setStatus("DENIED");
            response.setMessage("Member does not have an active subscription.");
            return response;
        }

        if (hasDuplicateAccess(bestMatch.memberId(), typeAcces)) {
            response.setMatched(Boolean.TRUE);
            response.setAccessGranted(Boolean.FALSE);
            response.setStatus("DENIED");
            response.setMessage("Duplicate access event is blocked.");
            return response;
        }

        writeAccessLog(bestMatch.memberId(), typeAcces, "AUTORISE", similarity);
        response.setMatched(Boolean.TRUE);
        response.setAccessGranted(Boolean.TRUE);
        response.setStatus("GRANTED");
        response.setMessage("Access granted.");
        return response;
    }

    public float computeSimilarity(float[] left, float[] right) {
        double distance = computeDistance(left, right);
        if (Double.isInfinite(distance) || Double.isNaN(distance)) {
            return 0.0F;
        }
        return (float) Math.max(0.0d, 1.0d - Math.min(1.0d, distance));
    }

    private double computeDistance(float[] left, float[] right) {
        if (left == null || right == null || left.length == 0 || right.length == 0 || left.length != right.length) {
            return Double.POSITIVE_INFINITY;
        }

        double sum = 0.0d;
        for (int i = 0; i < left.length; i++) {
            if (!Float.isFinite(left[i]) || !Float.isFinite(right[i])) {
                return Double.POSITIVE_INFINITY;
            }
            double delta = left[i] - right[i];
            sum += delta * delta;
        }

        return Math.sqrt(sum);
    }

    Optional<User> findBestAccountMatch(
            float[] sourceEmbedding,
            List<Face_Authentication> credentials,
            List<Face_Embedding> memberEmbeddings) {
        Map<UUID, UserMatch> matchesByUser = new HashMap<>();
        for (Face_Authentication credential : credentials) {
            float[] candidate = toFloatArray(credential.getVecteurFacial());
            float similarity = computeSimilarity(sourceEmbedding, candidate);
            recordBestUserMatch(matchesByUser, credential.getUser(), similarity);
        }

        for (Face_Embedding embedding : memberEmbeddings) {
            Member member = embedding.getMember();
            float similarity = computeSimilarity(sourceEmbedding, toFloatArray(embedding.getVecteurFacial()));
            recordBestUserMatch(matchesByUser, member, similarity);
        }

        UserMatch bestMatch = null;
        float secondBestSimilarity = -1.0f;
        for (UserMatch match : matchesByUser.values()) {
            if (bestMatch == null || match.similarity() > bestMatch.similarity()) {
                if (bestMatch != null) secondBestSimilarity = bestMatch.similarity();
                bestMatch = match;
            } else if (match.similarity() > secondBestSimilarity) {
                secondBestSimilarity = match.similarity();
            }
        }

        if (bestMatch == null || bestMatch.similarity() < minAcceptedSimilarity
                || (secondBestSimilarity >= 0.0f
                && bestMatch.similarity() - secondBestSimilarity < minAccountMatchMargin)) {
            return Optional.empty();
        }
        return Optional.of(bestMatch.user());
    }

    private void recordBestUserMatch(Map<UUID, UserMatch> matchesByUser, User user, float similarity) {
        if (user == null || user.getId() == null) return;
        UserMatch previousMatch = matchesByUser.get(user.getId());
        if (previousMatch == null || similarity > previousMatch.similarity()) {
            matchesByUser.put(user.getId(), new UserMatch(user, similarity));
        }
    }

    private MatchResult findBestMatch(float[] sourceEmbedding) {
        List<Face_Embedding> embeddings = faceEmbeddingRepository.findAll();
        MatchResult best = null;

        for (Face_Embedding faceEmbedding : embeddings) {
            float[] candidate = toFloatArray(faceEmbedding.getVecteurFacial());
            if (candidate.length == 0) {
                continue;
            }

            float similarity = computeSimilarity(sourceEmbedding, candidate);
            if (best == null || similarity > best.similarity()) {
                Member member = faceEmbedding.getMember();
                best = new MatchResult(
                        member.getId(),
                        member.getNom() + " " + member.getPrenom(),
                        similarity
                );
            }
        }

        return best;
    }

    private void writeAccessLog(UUID memberId, TypeAcces typeAcces, String resultat, float similarity) {
        AccessLogRequestDTO accessLog = new AccessLogRequestDTO();
        accessLog.setMemberId(memberId);
        accessLog.setTypeAcces(typeAcces);
        accessLog.setResultat(resultat);
        accessLog.setScoreConfiance(roundToTwoDecimals(similarity));
        accessLogService.create(accessLog);
    }

    private boolean hasDuplicateAccess(UUID memberId, TypeAcces typeAcces) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        return accessLogRepository.findByMemberId(memberId).stream()
                .filter(log -> log.getTypeAcces() == typeAcces)
                .anyMatch(log -> log.getHorodatage().isAfter(cutoff));
    }

    private float[] requestEmbedding(String imageBase64) {
        if (imageBase64 == null || imageBase64.isBlank()) {
            throw new IllegalArgumentException("An image is required for recognition.");
        }

        String normalized = imageBase64.trim();
        if (normalized.startsWith("data:image/")) {
            normalized = normalized.substring(normalized.indexOf(',') + 1);
        }

        Map<String, String> payload = new HashMap<>();
        payload.put("imageBase64", normalized);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(faceRecognitionUrl + "/api/face/embed"))
                    .header("Content-Type", "application/json")
                    .header("X-Internal-Key", faceServiceKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                if (response.statusCode() < 500) {
                    throw new BadRequestException("Capture must contain exactly one clear face.");
                }
                throw new IllegalStateException("Face recognition service failed to process the capture.");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode encoding = root.get("embedding");
            if (encoding == null || !encoding.isArray() || encoding.size() != 128) {
                throw new IllegalStateException("The face recognition service did not return an embedding.");
            }

            float[] embedding = new float[encoding.size()];
            for (int i = 0; i < encoding.size(); i++) {
                embedding[i] = (float) encoding.get(i).asDouble();
            }
            return embedding;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Face recognition service unavailable at " + faceRecognitionUrl + ". Start the Python face service first.", exception);
        } catch (IOException exception) {
            throw new IllegalStateException("Face recognition service unavailable at " + faceRecognitionUrl + ". Start the Python face service first.", exception);
        }
    }

    private float[] toFloatArray(byte[] bytes) {
        if (bytes == null || bytes.length == 0) {
            return new float[0];
        }

        ByteBuffer buffer = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN);
        float[] vector = new float[bytes.length / Float.BYTES];
        for (int i = 0; i < vector.length; i++) {
            vector[i] = buffer.getFloat();
        }
        return vector;
    }

    private byte[] toByteArray(float[] vector) {
        if (vector == null || vector.length == 0) {
            return new byte[0];
        }

        ByteBuffer buffer = ByteBuffer.allocate(vector.length * Float.BYTES).order(ByteOrder.LITTLE_ENDIAN);
        for (float value : vector) {
            buffer.putFloat(value);
        }
        return buffer.array();
    }

    private float roundToTwoDecimals(float value) {
        return Math.round(value * 100.0f) / 100.0f;
    }

    private record MatchResult(UUID memberId, String memberNom, float similarity) {
    }

    private record UserMatch(User user, float similarity) {
    }

    public record RecognizedAccount(String email, Role role) {
    }
}
