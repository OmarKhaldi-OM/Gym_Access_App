package com.example.gym_app.classes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class BookingRequestDTO {

    @NotNull(message = "L'id du membre est obligatoire")
    private UUID memberId;

    @NotNull(message = "L'id de la seance est obligatoire")
    private UUID scheduleId;

    @NotBlank(message = "Le statut est obligatoire")
    private String statut;
}
