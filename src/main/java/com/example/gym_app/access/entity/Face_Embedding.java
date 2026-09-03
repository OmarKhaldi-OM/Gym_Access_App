package com.example.gym_app.access.entity;

import com.example.gym_app.user.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "face_embedding")
@Getter
@Setter
@NoArgsConstructor
public class Face_Embedding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Lob
    @Column(name = "vecteur_facial", nullable = false)
    private byte[] vecteurFacial;

    @Column(name = "date_enregistrement", nullable = false)
    private LocalDateTime dateEnregistrement = LocalDateTime.now();
}