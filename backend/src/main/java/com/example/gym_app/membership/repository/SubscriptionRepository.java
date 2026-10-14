package com.example.gym_app.membership.repository;

import com.example.gym_app.membership.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByMemberId(UUID memberId);
    List<Subscription> findByStatutAndDateFinBefore(String statut, LocalDate date);
}
