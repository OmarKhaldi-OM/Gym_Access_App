package com.example.gym_app.user.repository;

import com.example.gym_app.user.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StaffRepository extends JpaRepository<Staff, UUID> {
    Optional<Staff> findByEmail(String email);
}
