package com.example.gym_app.access.controller;

import com.example.gym_app.access.dto.FaceEmbeddingRequestDTO;
import com.example.gym_app.access.dto.FaceEmbeddingResponseDTO;
import com.example.gym_app.access.service.FaceEmbeddingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/face-embeddings")
@CrossOrigin(origins = "http://localhost:8080")
public class FaceEmbeddingController {

    @Autowired
    private FaceEmbeddingService faceEmbeddingService;

    @GetMapping("/member/{memberId}")
    public List<FaceEmbeddingResponseDTO> getByMember(@PathVariable UUID memberId) {
        return faceEmbeddingService.findByMember(memberId);
    }

    @PostMapping
    public ResponseEntity<FaceEmbeddingResponseDTO> enroll(@Valid @RequestBody FaceEmbeddingRequestDTO dto) {
        return ResponseEntity.ok(faceEmbeddingService.enroll(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        faceEmbeddingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
