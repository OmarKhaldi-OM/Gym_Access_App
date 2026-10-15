package com.example.gym_app.access.dto;

import com.example.gym_app.access.entity.TypeAcces;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class AccessLogRequestDTO {

    @NotNull(message = "L'id du membre est obligatoire")
    private UUID memberId;

    private UUID staffId; // optionnel, seulement si validation manuelle

    @NotNull(message = "Le type d'acces (ENTREE/SORTIE) est obligatoire")
    private TypeAcces typeAcces;

    @NotBlank(message = "Le resultat est obligatoire")
    private String resultat;

    @DecimalMin(value = "0.0", message = "Le score doit etre entre 0 et 1")
    @DecimalMax(value = "1.0", message = "Le score doit etre entre 0 et 1")
    private Float scoreConfiance;
}
