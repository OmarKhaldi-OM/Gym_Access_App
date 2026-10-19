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

    @Column(name = "nom_en")
    private String nomEn;

    @Column(name = "nom_ar")
    private String nomAr;

    @Column(nullable = false)
    private BigDecimal prix;

    @Column(name = "duree_jours", nullable = false)
    private Integer dureeJours;

    @Column(nullable = false)
    private boolean actif = true;

    @OneToMany(mappedBy = "membership_plan")
    private List<Subscription> subscriptions;
}