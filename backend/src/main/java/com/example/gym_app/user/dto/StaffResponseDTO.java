package com.example.gym_app.user.dto;

import com.example.gym_app.user.entity.Role;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class StaffResponseDTO {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Role role;
    private LocalDate dateEmbauche;
    private String specialite;

}
