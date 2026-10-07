package com.example.gym_app.access.service;

import com.example.gym_app.access.dto.AccessLogRequestDTO;
import com.example.gym_app.access.dto.FaceRecognitionResponseDTO;
import com.example.gym_app.access.entity.Access_Log;
import com.example.gym_app.access.entity.Face_Embedding;
import com.example.gym_app.access.entity.TypeAcces;
import com.example.gym_app.access.repository.AccessLogRepository;
import com.example.gym_app.access.repository.FaceEmbeddingRepository;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.membership.service.SubscriptionService;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.repository.MemberRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FaceRecognitionService {

    private static final double MIN_ACCEPTED_SIMILARITY = 0.60d;

    @Autowired
    private FaceEmbeddingRepository faceEmbeddingRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private AccessLogRepository accessLogRepository;

    @Autowired
    private AccessLogService accessLogService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Value("${app.face-recognition.url:http://localhost:8001}")
    private String faceRecognitionUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder().build();

    public FaceRecognitionResponseDTO enroll(UUID memberId, String imageBase64) {
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

        if (similarity < MIN_ACCEPTED_SIMILARITY) {
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
        if (left == null || right == null || left.length == 0 || right.length == 0 || left.length != right.length) {
            return 0.0F;
        }

        double sum = 0.0d;
        for (int i = 0; i < left.length; i++) {
            double delta = left[i] - right[i];
            sum += delta * delta;
        }

        double distance = Math.sqrt(sum) / Math.sqrt(2.0d * left.length);
        double similarity = 1.0d - Math.min(1.0d, Math.max(0.0d, distance));
        return (float) Math.max(0.0d, similarity);
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
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new IllegalStateException("Face recognition service rejected the capture: " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode encoding = root.get("embedding");
            if (encoding == null || !encoding.isArray()) {
                throw new IllegalStateException("The face recognition service did not return an embedding.");
            }

            float[] embedding = new float[encoding.size()];
            for (int i = 0; i < encoding.size(); i++) {
                embedding[i] = (float) encoding.get(i).asDouble();
            }
            return embedding;
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
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
}
