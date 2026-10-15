package com.example.gym_app.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FaceLoginRequestDTO {

    @NotBlank(message = "Une image faciale est obligatoire")
    private String imageBase64;
}
