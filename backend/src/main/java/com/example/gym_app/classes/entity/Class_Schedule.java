package com.example.gym_app.classes.entity;

import com.example.gym_app.user.entity.Trainer;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "class_schedule")
@Getter
@Setter
@NoArgsConstructor
public class Class_Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private Gym_Class gymClass;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    @Column(name = "date_heure", nullable = false)
    private LocalDateTime dateHeure;

    @Column(name = "duree_min", nullable = false)
    private Integer dureeMin;

    @OneToMany(mappedBy = "classSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings;
}