package com.example.gym_app.access.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class FaceEnrollmentRequestDTO {

    @NotNull(message = "L'id du membre est obligatoire")
    private UUID memberId;

    @NotBlank(message = "Une image faciale est obligatoire")
    private String imageBase64;
}
