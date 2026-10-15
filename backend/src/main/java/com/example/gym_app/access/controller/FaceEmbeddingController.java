package com.example.gym_app.access.controller;

import com.example.gym_app.access.dto.FaceEmbeddingRequestDTO;
import com.example.gym_app.access.dto.FaceEmbeddingResponseDTO;
import com.example.gym_app.access.service.FaceEmbeddingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/face-embeddings")
@CrossOrigin(origins = "http://localhost:5173")
public class FaceEmbeddingController {

    private final FaceEmbeddingService faceEmbeddingService;

    public FaceEmbeddingController(
            FaceEmbeddingService faceEmbeddingService) {
        this.faceEmbeddingService = faceEmbeddingService;
    }

    @GetMapping("/member/{memberId}")
    public List<FaceEmbeddingResponseDTO> getByMember(@PathVariable("memberId") UUID memberId) {
        return faceEmbeddingService.findByMember(memberId);
    }

    @PostMapping
    public ResponseEntity<FaceEmbeddingResponseDTO> enroll(@Valid @RequestBody FaceEmbeddingRequestDTO dto) {
        return ResponseEntity.ok(faceEmbeddingService.enroll(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        faceEmbeddingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
