package com.example.gym_app.access.entity;

import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Staff;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "access_log")
@Getter
@Setter
@NoArgsConstructor
public class Access_Log {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(nullable = false)
    private LocalDateTime horodatage = LocalDateTime.now();

    @Column(nullable = false)
    private String resultat;

    @Column(name = "score_confiance")
    private Float scoreConfiance;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_acces", nullable = false)
    private TypeAcces typeAcces;
}