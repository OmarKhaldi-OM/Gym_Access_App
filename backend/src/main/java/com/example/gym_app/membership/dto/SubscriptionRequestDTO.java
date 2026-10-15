package com.example.gym_app.membership.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class SubscriptionRequestDTO {

    @NotNull(message = "L'id du membre est obligatoire")
    private UUID memberId;

    @NotNull(message = "L'id du plan est obligatoire")
    private UUID planId;

    @NotNull(message = "La date de debut est obligatoire")
    private LocalDate dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @FutureOrPresent(message = "La date de fin doit etre aujourd'hui ou dans le futur")
    private LocalDate dateFin;

    @NotBlank(message = "Le statut est obligatoire")
    private String statut;
}
