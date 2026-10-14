package com.example.gym_app.training.entity;

import com.example.gym_app.user.entity.Member;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "member_goal")
@Getter
@Setter
@NoArgsConstructor
public class MemberGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, length = 180)
    private String name;

    @Column(nullable = false)
    private Integer target;

    @Column(nullable = false)
    private Integer current = 0;

    private LocalDate deadline;

    @Column(nullable = false)
    private String status = "ACTIVE";
}