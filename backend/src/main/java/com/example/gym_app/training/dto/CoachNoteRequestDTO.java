package com.example.gym_app.training.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoachNoteRequestDTO {
    @NotBlank
    @Size(max = 10000)
    private String contenu;
}
