package com.example.gym_app.access.repository;

import com.example.gym_app.access.entity.Face_Authentication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FaceAuthenticationRepository extends JpaRepository<Face_Authentication, UUID> {
    Optional<Face_Authentication> findByUserId(UUID userId);
}
