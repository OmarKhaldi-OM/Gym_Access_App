package com.example.gym_app.training.repository;

import com.example.gym_app.training.entity.CoachNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CoachNoteRepository extends JpaRepository<CoachNote, UUID> {
    List<CoachNote> findByCoachIdAndMemberIdOrderByCreatedAtDesc(UUID coachId, UUID memberId);
}
