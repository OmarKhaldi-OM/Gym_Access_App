package com.example.gym_app.training.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class TrainerBookingRequestDTO {

    @NotNull(message = "L'id du membre est obligatoire")
    private UUID memberId;

    @NotNull(message = "L'id du trainer est obligatoire")
    private UUID trainerId;

    @NotNull(message = "La date et l'heure sont obligatoires")
    @Future(message = "La seance doit etre programmee dans le futur")
    private LocalDateTime dateHeure;

    @NotBlank(message = "Le statut est obligatoire")
    private String statut;
}
