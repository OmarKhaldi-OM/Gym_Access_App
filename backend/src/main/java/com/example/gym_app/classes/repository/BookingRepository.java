package com.example.gym_app.classes.repository;

import com.example.gym_app.classes.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByMemberId(UUID memberId);
    List<Booking> findByClassScheduleId(UUID scheduleId);
    long countByClassScheduleId(UUID scheduleId);
}
