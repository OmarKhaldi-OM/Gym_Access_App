package com.example.gym_app.user.controller;

import com.example.gym_app.user.dto.TrainerRequestDTO;
import com.example.gym_app.user.dto.TrainerResponseDTO;
import com.example.gym_app.user.dto.TrainerUpdateRequestDTO;
import com.example.gym_app.user.service.TrainerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    private final TrainerService trainerService;

    public TrainerController(
            TrainerService trainerService) {
        this.trainerService = trainerService;
    }

    @GetMapping
    public List<TrainerResponseDTO> getAll() {
        return trainerService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerResponseDTO> getById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(trainerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TrainerResponseDTO> create(@Valid @RequestBody TrainerRequestDTO dto) {
        return ResponseEntity.ok(trainerService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerResponseDTO> update(@PathVariable("id") UUID id, @Valid @RequestBody TrainerUpdateRequestDTO dto) {
        return ResponseEntity.ok(trainerService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        trainerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
