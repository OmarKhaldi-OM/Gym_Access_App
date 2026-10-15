package com.example.gym_app.training.entity;

import com.example.gym_app.user.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "progress_log")
@Getter
@Setter
@NoArgsConstructor
public class Progress_Log {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "date_mesure", nullable = false)
    private LocalDate dateMesure;

    private Float poids;

    @Column(name = "masse_grasse")
    private Float masseGrasse;

    @Column(columnDefinition = "TEXT")
    private String notes;
}