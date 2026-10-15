package com.example.gym_app.user.repository;

import com.example.gym_app.user.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TrainerRepository extends JpaRepository<Trainer, UUID> {
    List<Trainer> findBySpecialite(String specialite);
}
