package com.example.gym_app.classes.repository;

import com.example.gym_app.classes.entity.Class_Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ClassScheduleRepository extends JpaRepository<Class_Schedule, UUID> {
    List<Class_Schedule> findByTrainerId(UUID trainerId);
    List<Class_Schedule> findByDateHeureBetween(LocalDateTime start, LocalDateTime end);
}
