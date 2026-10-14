package com.example.gym_app.classes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GymClassRequestDTO {

    @NotBlank(message = "Le nom de la classe est obligatoire")
    private String nom;

    private String description;

    @NotNull(message = "La capacite maximale est obligatoire")
    @Min(value = 1, message = "La capacite doit etre d'au moins 1")
    private Integer capaciteMax;
}
