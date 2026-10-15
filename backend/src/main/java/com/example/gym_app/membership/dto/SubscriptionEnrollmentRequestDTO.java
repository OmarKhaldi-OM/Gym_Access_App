package com.example.gym_app.membership.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class SubscriptionEnrollmentRequestDTO {

    @NotNull(message = "L'id du plan est obligatoire")
    private UUID planId;
}
