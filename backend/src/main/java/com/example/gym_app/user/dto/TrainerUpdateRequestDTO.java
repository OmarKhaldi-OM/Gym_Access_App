package com.example.gym_app.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TrainerUpdateRequestDTO {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 255, message = "Le nom ne peut pas depasser 255 caracteres")
    private String nom;

    @NotBlank(message = "Le prenom est obligatoire")
    @Size(max = 255, message = "Le prenom ne peut pas depasser 255 caracteres")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Size(max = 255, message = "L'email ne peut pas depasser 255 caracteres")
    private String email;

    @Size(max = 255, message = "Le telephone ne peut pas depasser 255 caracteres")
    private String telephone;

    @NotNull(message = "La date d'embauche est obligatoire")
    @PastOrPresent(message = "La date d'embauche ne peut pas etre dans le futur")
    private LocalDate dateEmbauche;

    @NotBlank(message = "La specialite est obligatoire")
    @Size(max = 255, message = "La specialite ne peut pas depasser 255 caracteres")
    private String specialite;
}
