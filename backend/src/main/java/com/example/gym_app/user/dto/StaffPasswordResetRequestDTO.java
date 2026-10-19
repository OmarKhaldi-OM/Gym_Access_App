package com.example.gym_app.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StaffPasswordResetRequestDTO {

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 10, message = "Le nouveau mot de passe doit contenir au moins 10 caractères")
    private String newPassword;
}
