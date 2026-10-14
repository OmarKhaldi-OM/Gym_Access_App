package com.example.gym_app.classes.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class ClassScheduleResponseDTO {
    private UUID id;
    private UUID classId;
    private String className;
    private UUID trainerId;
    private String trainerNom;
    private LocalDateTime dateHeure;
    private Integer dureeMin;

}
