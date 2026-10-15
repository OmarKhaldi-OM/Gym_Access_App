package com.example.gym_app.user.repository;

import com.example.gym_app.user.entity.GoogleIdentity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GoogleIdentityRepository extends JpaRepository<GoogleIdentity, UUID> {
    @EntityGraph(attributePaths = "user")
    Optional<GoogleIdentity> findByIssuerAndSubject(String issuer, String subject);

    @EntityGraph(attributePaths = "user")
    Optional<GoogleIdentity> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
