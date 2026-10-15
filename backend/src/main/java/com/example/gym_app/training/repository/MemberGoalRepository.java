package com.example.gym_app.training.repository;

import com.example.gym_app.training.entity.MemberGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MemberGoalRepository extends JpaRepository<MemberGoal, UUID> {
    List<MemberGoal> findByMemberIdOrderByDeadlineAsc(UUID memberId);
}