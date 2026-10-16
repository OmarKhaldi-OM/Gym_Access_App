package com.example.gym_app.training.controller;

import com.example.gym_app.training.dto.ProgressLogRequestDTO;
import com.example.gym_app.training.dto.ProgressLogResponseDTO;
import com.example.gym_app.training.service.ProgressLogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress-logs")
public class ProgressLogController {

    private final ProgressLogService progressLogService;

    public ProgressLogController(
            ProgressLogService progressLogService) {
        this.progressLogService = progressLogService;
    }

    @GetMapping("/member/{memberId}")
    public List<ProgressLogResponseDTO> getByMember(@PathVariable("memberId") UUID memberId) {
        return progressLogService.findByMember(memberId);
    }

    @PostMapping
    public ResponseEntity<ProgressLogResponseDTO> create(@Valid @RequestBody ProgressLogRequestDTO dto) {
        return ResponseEntity.ok(progressLogService.create(dto));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ProgressLogResponseDTO> update(@PathVariable("id") UUID id, @Valid @RequestBody ProgressLogRequestDTO dto) {
        return ResponseEntity.ok(progressLogService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        progressLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
