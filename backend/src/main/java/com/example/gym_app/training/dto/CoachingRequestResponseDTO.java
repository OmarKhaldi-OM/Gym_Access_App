package com.example.gym_app.training.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class CoachingRequestResponseDTO {
    private UUID id;
    private UUID memberId;
    private String memberName;
    private boolean memberArchived;
    private UUID trainerId;
    private String trainerName;
    private LocalDateTime requestedAt;
    private String goal;
    private String status;
    private String response;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}