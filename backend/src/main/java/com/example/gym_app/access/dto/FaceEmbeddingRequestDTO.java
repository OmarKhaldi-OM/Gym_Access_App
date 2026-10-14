package com.example.gym_app.access.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class FaceEmbeddingRequestDTO {

    @NotNull(message = "L'id du membre est obligatoire")
    private UUID memberId;

    @NotNull(message = "Le vecteur facial est obligatoire")
    private byte[] vecteurFacial;
}
