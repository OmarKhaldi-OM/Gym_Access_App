package com.example.gym_app.training.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class CoachingRequestCreateDTO {
    @NotNull
    private UUID memberId;

    @NotNull
    private UUID trainerId;

    @NotNull
    @Future
    private LocalDateTime requestedAt;

    @NotBlank
    private String goal;
}