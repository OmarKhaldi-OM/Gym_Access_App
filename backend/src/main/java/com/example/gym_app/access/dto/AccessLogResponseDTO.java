package com.example.gym_app.access.dto;

import com.example.gym_app.access.entity.TypeAcces;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class AccessLogResponseDTO {
    private UUID id;
    private UUID memberId;
    private String memberNom;
    private UUID staffId;
    private LocalDateTime horodatage;
    private String resultat;
    private Float scoreConfiance;
    private TypeAcces typeAcces;

}
