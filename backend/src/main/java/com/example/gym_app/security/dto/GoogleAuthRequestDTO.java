package com.example.gym_app.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GoogleAuthRequestDTO {
    @NotBlank
    private String credential;
}
