package com.example.gym_app.security.dto;

import lombok.Getter;

import java.util.UUID;

@Getter

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

    public CurrentUserDTO(UUID id, String nom, String prenom, String email, String role,
                          String telephone, String bio, boolean hasProfilePhoto, String token) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
        this.telephone = telephone;
        this.bio = bio;
        this.hasProfilePhoto = hasProfilePhoto;
        this.token = token;
    }
}