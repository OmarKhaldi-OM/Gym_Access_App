package com.example.gym_app.access.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class FaceRecognitionResponseDTO {

    private UUID memberId;
    private String memberNom;
    private Float confidence;
    private Boolean matched;
    private Boolean accessGranted;
    private String accessType;
    private String status;
    private String message;
    private Boolean faceDetected;
}
