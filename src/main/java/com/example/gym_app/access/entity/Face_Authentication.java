package com.example.gym_app.access.entity;

import com.example.gym_app.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "face_authentication")
@Getter
@Setter
@NoArgsConstructor
public class Face_Authentication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Lob
    @Column(name = "vecteur_facial", nullable = false)
    private byte[] vecteurFacial;

    @Column(name = "date_enregistrement", nullable = false)
    private LocalDateTime dateEnregistrement = LocalDateTime.now();
}
