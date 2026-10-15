package com.example.gym_app.membership.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class MembershipPlanRequestDTO {

    @NotBlank(message = "Le nom du plan est obligatoire")
    private String nom;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit etre superieur a zero")
    private BigDecimal prix;

    @NotNull(message = "La duree en jours est obligatoire")
    @Min(value = 1, message = "La duree doit etre d'au moins 1 jour")
    private Integer dureeJours;

    private Boolean actif;
}
