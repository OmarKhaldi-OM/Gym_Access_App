package com.example.gym_app.user.repository;

import com.example.gym_app.user.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID> {
        Optional<Member> findByEmail(String email);
        List<Member> findByArchivedFalse();

        @Query(value = "select email from app_user where email = :email for update", nativeQuery = true)
        Optional<String> lockAccountByEmail(@Param("email") String email);
}
