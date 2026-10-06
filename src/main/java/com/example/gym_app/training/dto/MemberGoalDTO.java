package com.example.gym_app.training.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class MemberGoalDTO {
    private UUID id;
    private UUID memberId;

    @NotBlank
    private String name;

    @NotNull
    @Min(1)
    private Integer target;

    @NotNull
    @Min(0)
    private Integer current;

    private LocalDate deadline;
    private String status;
}