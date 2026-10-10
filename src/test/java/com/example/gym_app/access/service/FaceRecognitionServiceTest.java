package com.example.gym_app.access.service;

import static org.junit.jupiter.api.Assertions.*;

import com.example.gym_app.access.entity.Face_Authentication;
import com.example.gym_app.access.entity.Face_Embedding;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.entity.User;
import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

class FaceRecognitionServiceTest {

    @Test
    void shouldRejectMembersWhenSimilarityIsTooLow() {
        FaceRecognitionService service = createService();

        float[] enrolled = new float[] {0.1f, 0.2f, 0.3f, 0.4f};
        float[] candidate = new float[] {0.9f, 0.8f, 0.7f, 0.6f};

        float similarity = service.computeSimilarity(enrolled, candidate);

        assertTrue(similarity < 0.8f, "A distant face should not be considered a valid match");
    }

    @Test
    void shouldAcceptStrongMatchAboveThreshold() {
        FaceRecognitionService service = createService();

        float[] enrolled = new float[] {0.75f, 0.85f, 0.9f, 0.95f};
        float[] candidate = new float[] {0.77f, 0.84f, 0.91f, 0.93f};

        float similarity = service.computeSimilarity(enrolled, candidate);

        assertTrue(similarity >= 0.9f, "A strong face match should clear the recognition threshold");
    }

    @Test
    void shouldMatchTheEnrolledMemberAdminAndReceptionistAccounts() {
        FaceRecognitionService service = createService();
        List<Role> roles = List.of(Role.MEMBER, Role.ADMIN, Role.RECEPTIONIST);
        List<float[]> embeddings = List.of(
                new float[] {0.0f, 0.0f, 0.0f, 0.0f},
                new float[] {0.5f, 0.5f, 0.5f, 0.5f},
                new float[] {1.0f, 1.0f, 1.0f, 1.0f}
        );

        for (int target = 0; target < roles.size(); target++) {
            List<Face_Authentication> credentials = new ArrayList<>();
            for (int account = 0; account < roles.size(); account++) {
                Face_Authentication credential = new Face_Authentication();
                credential.setUser(createUser(roles.get(account), "user" + account + "@example.com"));
                credential.setVecteurFacial(toBytes(embeddings.get(account)));
                credentials.add(credential);
            }

            var recognized = service.findBestAccountMatch(embeddings.get(target), credentials, List.of());

            assertTrue(recognized.isPresent());
            assertEquals(roles.get(target), recognized.orElseThrow().getRole());
        }
    }

    @Test
    void shouldDenyUnrecognizedAndAmbiguousFaces() {
        FaceRecognitionService service = createService();
        Face_Authentication first = credential(Role.MEMBER, "member@example.com", new float[] {0f, 0f, 0f, 0f});
        Face_Authentication second = credential(Role.ADMIN, "admin@example.com", new float[] {0f, 0f, 0f, 0f});

        assertTrue(service.findBestAccountMatch(
                new float[] {1f, 1f, 1f, 1f},
                List.of(first),
                List.of()
        ).isEmpty());
        assertTrue(service.findBestAccountMatch(
                new float[] {0f, 0f, 0f, 0f},
                List.of(first, second),
                List.of()
        ).isEmpty());
    }

    @Test
    void shouldRecognizeMembersWithPreviouslyEnrolledAccessFaces() {
        FaceRecognitionService service = createService();
        Member member = (Member) createUser(Role.MEMBER, "member@example.com");
        Face_Embedding accessEmbedding = new Face_Embedding();
        accessEmbedding.setMember(member);
        accessEmbedding.setVecteurFacial(toBytes(new float[] {0.25f, 0.25f, 0.25f, 0.25f}));

        var recognized = service.findBestAccountMatch(
                new float[] {0.25f, 0.25f, 0.25f, 0.25f},
                List.of(),
                List.of(accessEmbedding)
        );

        assertTrue(recognized.isPresent());
        assertEquals(Role.MEMBER, recognized.orElseThrow().getRole());
    }

    private Face_Authentication credential(Role role, String email, float[] embedding) {
        Face_Authentication credential = new Face_Authentication();
        credential.setUser(createUser(role, email));
        credential.setVecteurFacial(toBytes(embedding));
        return credential;
    }

    private User createUser(Role role, String email) {
        User user = role == Role.MEMBER ? new Member() : new Staff();
        user.setRole(role);
        user.setEmail(email);
        user.setId(UUID.randomUUID());
        return user;
    }

    private byte[] toBytes(float[] values) {
        ByteBuffer buffer = ByteBuffer.allocate(values.length * Float.BYTES).order(ByteOrder.LITTLE_ENDIAN);
        for (float value : values) {
            buffer.putFloat(value);
        }
        return buffer.array();
    }

    private FaceRecognitionService createService() {
        return new FaceRecognitionService(null, null, null, null, null, null, null, null);
    }
}
