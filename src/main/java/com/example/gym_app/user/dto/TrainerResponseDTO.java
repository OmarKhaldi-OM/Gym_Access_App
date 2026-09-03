package com.example.gym_app.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class TrainerResponseDTO {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private LocalDate dateEmbauche;
    private String specialite;

}
