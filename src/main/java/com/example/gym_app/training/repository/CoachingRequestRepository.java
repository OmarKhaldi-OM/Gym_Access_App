package com.example.gym_app.training.repository;

import com.example.gym_app.training.entity.CoachingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CoachingRequestRepository extends JpaRepository<CoachingRequest, UUID> {
    List<CoachingRequest> findByMemberIdOrderByCreatedAtDesc(UUID memberId);
    List<CoachingRequest> findByTrainerIdOrderByCreatedAtDesc(UUID trainerId);
}