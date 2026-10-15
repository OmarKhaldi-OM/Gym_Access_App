package com.example.gym_app.classes.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
public class GymClassResponseDTO {
    private UUID id;
    private String nom;
    private String description;
    private Integer capaciteMax;

}
