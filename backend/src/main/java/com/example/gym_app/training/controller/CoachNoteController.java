package com.example.gym_app.training.controller;

import com.example.gym_app.training.dto.CoachNoteRequestDTO;
import com.example.gym_app.training.dto.CoachNoteResponseDTO;
import com.example.gym_app.training.service.CoachNoteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/coach-notes")
public class CoachNoteController {
    private final CoachNoteService coachNoteService;

    public CoachNoteController(CoachNoteService coachNoteService) {
        this.coachNoteService = coachNoteService;
    }

    @GetMapping("/member/{memberId}")
    public List<CoachNoteResponseDTO> getByMember(@PathVariable UUID memberId) {
        return coachNoteService.findByMember(memberId);
    }

    @PostMapping("/member/{memberId}")
    public ResponseEntity<CoachNoteResponseDTO> create(
            @PathVariable UUID memberId,
            @Valid @RequestBody CoachNoteRequestDTO request) {
        return ResponseEntity.ok(coachNoteService.create(memberId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoachNoteResponseDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody CoachNoteRequestDTO request) {
        return ResponseEntity.ok(coachNoteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        coachNoteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
