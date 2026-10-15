package com.example.gym_app.classes.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class ClassScheduleRequestDTO {

    @NotNull(message = "L'id de la classe est obligatoire")
    private UUID classId;

    @NotNull(message = "L'id du trainer est obligatoire")
    private UUID trainerId;

    @NotNull(message = "La date et l'heure sont obligatoires")
    @Future(message = "La seance doit etre programmee dans le futur")
    private LocalDateTime dateHeure;

    @NotNull(message = "La duree est obligatoire")
    @Min(value = 1, message = "La duree doit etre d'au moins 1 minute")
    private Integer dureeMin;
}
