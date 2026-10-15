package com.example.gym_app.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "google_identity",
        uniqueConstraints = @UniqueConstraint(name = "uq_google_identity_issuer_subject", columnNames = {"issuer", "subject"}))
@Getter
@Setter
@NoArgsConstructor
public class GoogleIdentity {

    @Id
    @Column(name = "user_id", columnDefinition = "BINARY(16)")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String issuer;

    @Column(nullable = false)
    private String subject;
}
