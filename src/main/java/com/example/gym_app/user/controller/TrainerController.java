package com.example.gym_app.user.controller;

import com.example.gym_app.user.dto.TrainerRequestDTO;
import com.example.gym_app.user.dto.TrainerResponseDTO;
import com.example.gym_app.user.service.TrainerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainers")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainerController {

    @Autowired
    private TrainerService trainerService;

    @GetMapping
    public List<TrainerResponseDTO> getAll() {
        return trainerService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainerResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(trainerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<TrainerResponseDTO> create(@Valid @RequestBody TrainerRequestDTO dto) {
        return ResponseEntity.ok(trainerService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrainerResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody TrainerRequestDTO dto) {
        return ResponseEntity.ok(trainerService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        trainerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
