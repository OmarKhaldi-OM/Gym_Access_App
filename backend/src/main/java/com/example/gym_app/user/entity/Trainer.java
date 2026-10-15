package com.example.gym_app.user.entity;

import com.example.gym_app.classes.entity.Class_Schedule;
import com.example.gym_app.training.entity.Trainer_Booking;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "trainer")
@Getter
@Setter
@NoArgsConstructor
public class Trainer extends Staff {

    @Column(name = "specialite")
    private String specialite;

    @OneToMany(mappedBy = "trainer")
    private List<Class_Schedule> classSchedules;

    @OneToMany(mappedBy = "trainer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Trainer_Booking> trainerBookings;
}