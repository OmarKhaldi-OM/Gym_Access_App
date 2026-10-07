package com.example.gym_app.access.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class FaceRecognitionServiceTest {

    @Test
    void shouldRejectMembersWhenSimilarityIsTooLow() {
        FaceRecognitionService service = new FaceRecognitionService();

        float[] enrolled = new float[] {0.1f, 0.2f, 0.3f, 0.4f};
        float[] candidate = new float[] {0.9f, 0.8f, 0.7f, 0.6f};

        float similarity = service.computeSimilarity(enrolled, candidate);

        assertTrue(similarity < 0.8f, "A distant face should not be considered a valid match");
    }

    @Test
    void shouldAcceptStrongMatchAboveThreshold() {
        FaceRecognitionService service = new FaceRecognitionService();

        float[] enrolled = new float[] {0.75f, 0.85f, 0.9f, 0.95f};
        float[] candidate = new float[] {0.77f, 0.84f, 0.91f, 0.93f};

        float similarity = service.computeSimilarity(enrolled, candidate);

        assertTrue(similarity >= 0.9f, "A strong face match should clear the recognition threshold");
    }
}
