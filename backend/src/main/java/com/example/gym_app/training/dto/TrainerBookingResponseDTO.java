package com.example.gym_app.training.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class TrainerBookingResponseDTO {
    private UUID id;
    private UUID memberId;
    private String memberNom;
    private boolean memberArchived;
    private UUID trainerId;
    private String trainerNom;
    private LocalDateTime dateHeure;
    private String statut;

}
