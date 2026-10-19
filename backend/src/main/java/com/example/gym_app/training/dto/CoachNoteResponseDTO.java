package com.example.gym_app.training.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class CoachNoteResponseDTO {
    private UUID id;
    private UUID coachId;
    private UUID memberId;
    private String contenu;
    private LocalDateTime createdAt;
}
