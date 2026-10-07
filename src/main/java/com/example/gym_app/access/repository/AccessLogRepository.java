package com.example.gym_app.access.repository;

import com.example.gym_app.access.entity.Access_Log;
import org.apache.catalina.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AccessLogRepository extends JpaRepository<Access_Log, UUID> {
    List<Access_Log> findByMemberId(UUID memberId);
    List<Access_Log> findByHorodatageBetween(LocalDateTime start, LocalDateTime end);
    List<Access_Log> findByResultat(String resultat);
    List<Access_Log> findByMemberIdAndTypeAcces(UUID memberId, com.example.gym_app.access.entity.TypeAcces typeAcces);
}
