package com.example.gym_app.membership.repository;
import com.example.gym_app.membership.entity.Membership_Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MembershipPlanRepository extends JpaRepository<Membership_Plan, UUID> {
    boolean existsByNom(String nom);
}
