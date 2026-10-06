package com.example.gym_app.user.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class MemberResponseDTO {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private LocalDate dateNaissance;
    private LocalDateTime dateInscription;
    private boolean visageEnrole;
}
