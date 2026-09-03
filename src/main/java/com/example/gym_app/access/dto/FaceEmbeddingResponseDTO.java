package com.example.gym_app.access.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class FaceEmbeddingResponseDTO {
    private UUID id;
    private UUID memberId;
    private LocalDateTime dateEnregistrement;
    // vecteurFacial volontairement absent : donnee sensible, pas besoin de la renvoyer au client

}
