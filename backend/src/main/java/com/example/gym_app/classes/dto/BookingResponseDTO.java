package com.example.gym_app.classes.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class BookingResponseDTO {
    private UUID id;
    private UUID memberId;
    private String memberNom;
    private boolean memberArchived;
    private UUID scheduleId;
    private LocalDateTime dateReservation;
    private String statut;

}
