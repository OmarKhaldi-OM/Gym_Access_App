package com.example.gym_app.training.repository;


import com.example.gym_app.training.entity.Progress_Log;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProgressLogRepository extends JpaRepository<Progress_Log, UUID> {
    List<Progress_Log> findByMemberIdOrderByDateMesureAsc(UUID memberId);
}
