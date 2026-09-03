package com.example.gym_app.user.entity;

import com.example.gym_app.access.entity.Access_Log;
import com.example.gym_app.access.entity.Face_Embedding;
import com.example.gym_app.classes.entity.Booking;
import com.example.gym_app.membership.entity.Subscription;
import com.example.gym_app.training.entity.Progress_Log;
import com.example.gym_app.training.entity.Trainer_Booking;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
public class Member extends User {

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    @Column(name = "date_inscription")
    private LocalDateTime dateInscription = LocalDateTime.now();

    @JsonManagedReference
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subscription> subscriptions;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Face_Embedding> faceEmbeddings;

    @OneToMany(mappedBy = "member")
    private List<Access_Log> accessLogs;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Trainer_Booking> trainerBookings;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Progress_Log> progressLogs;
}