package com.example.gym_app.training.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class ProgressLogResponseDTO {
    private UUID id;
    private UUID memberId;
    private LocalDate dateMesure;
    private Float poids;
    private Float masseGrasse;
    private String notes;

}
