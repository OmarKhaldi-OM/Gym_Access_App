package com.example.gym_app.training.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ProgressLogRequestDTO {

    @NotNull(message = "L'id du membre est obligatoire")
    private UUID memberId;

    @NotNull(message = "La date de mesure est obligatoire")
    @PastOrPresent(message = "La date de mesure ne peut pas etre dans le futur")
    private LocalDate dateMesure;

    @Positive(message = "Le poids doit etre superieur a zero")
    private Float poids;

    @Positive(message = "La masse grasse doit etre superieure a zero")
    private Float masseGrasse;

    private String notes;
}
