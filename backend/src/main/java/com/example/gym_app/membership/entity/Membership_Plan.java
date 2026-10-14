package com.example.gym_app.membership.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "membership_plan")
@Getter
@Setter
@NoArgsConstructor
public class Membership_Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private BigDecimal prix;

    @Column(name = "duree_jours", nullable = false)
    private Integer dureeJours;

    @OneToMany(mappedBy = "membership_plan")
    private List<Subscription> subscriptions;
}