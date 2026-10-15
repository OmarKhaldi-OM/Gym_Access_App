package com.example.gym_app.training.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CoachingRequestStatusDTO {
    @NotBlank
    private String status;
    private String response;
}