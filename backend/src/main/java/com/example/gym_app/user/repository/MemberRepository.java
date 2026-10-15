package com.example.gym_app.user.repository;

import com.example.gym_app.user.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID> {
        Optional<Member> findByEmail(String email);
        List<Member> findByArchivedFalse();
}
