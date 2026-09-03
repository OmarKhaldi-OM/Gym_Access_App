package com.example.gym_app.training.repository;

import com.example.gym_app.training.entity.Trainer_Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TrainerBookingRepository extends JpaRepository<Trainer_Booking, UUID> {
    List<Trainer_Booking> findByMemberId(UUID memberId);
    List<Trainer_Booking> findByTrainerId(UUID trainerId);
}
