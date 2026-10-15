package com.example.gym_app.access.repository;


import com.example.gym_app.access.entity.Face_Embedding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FaceEmbeddingRepository extends JpaRepository<Face_Embedding, UUID> {
    List<Face_Embedding> findByMemberId(UUID memberId);
    List<Face_Embedding> findAll();
}
