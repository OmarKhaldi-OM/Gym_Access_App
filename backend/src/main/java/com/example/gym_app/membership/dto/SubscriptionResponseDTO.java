package com.example.gym_app.membership.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
public class SubscriptionResponseDTO {
    private UUID id;
    private UUID memberId;
    private String memberNom;
    private UUID planId;
    private String planNom;
    private String planNomEn;
    private String planNomAr;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;

}
