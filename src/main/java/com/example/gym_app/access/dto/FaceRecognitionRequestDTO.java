package com.example.gym_app.access.dto;

import com.example.gym_app.access.entity.TypeAcces;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FaceRecognitionRequestDTO {

    @NotBlank(message = "Une image faciale est obligatoire")
    private String imageBase64;

    @NotNull(message = "Le type d'acces est obligatoire")
    private TypeAcces typeAcces;
}
