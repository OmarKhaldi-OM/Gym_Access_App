package com.example.gym_app.membership.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Setter
@Getter
public class MembershipPlanResponseDTO {
    private UUID id;
    private String nom;
    private BigDecimal prix;
    private Integer dureeJours;
    private boolean actif;

}
