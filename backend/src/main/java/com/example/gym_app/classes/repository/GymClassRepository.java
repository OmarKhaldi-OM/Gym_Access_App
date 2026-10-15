package com.example.gym_app.classes.repository;

import com.example.gym_app.classes.entity.Gym_Class;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GymClassRepository extends JpaRepository<Gym_Class, UUID> {
    boolean existsByNom(String nom);
}
