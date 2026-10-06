package com.example.gym_app.security.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class CurrentUserDTO {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String telephone;
    private String bio;
    private boolean hasProfilePhoto;
    private String token;
}