package com.example.gym_app.access.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FaceAccountEnrollmentRequestDTO {

    @NotBlank(message = "Une image faciale est obligatoire")
    private String imageBase64;
}
