package com.example.gym_app.user.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TrainerRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prenom est obligatoire")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres")
    private String motDePasse;

    @NotNull(message = "La date d'embauche est obligatoire")
    @PastOrPresent(message = "La date d'embauche ne peut pas etre dans le futur")
    private LocalDate dateEmbauche;

    @NotBlank(message = "La specialite est obligatoire")
    private String specialite;
}
