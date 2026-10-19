package com.example.gym_app.training.entity;

import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Trainer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coach_note")
@Getter
@Setter
@NoArgsConstructor
public class CoachNote {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_id", nullable = false)
    private Trainer coach;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
