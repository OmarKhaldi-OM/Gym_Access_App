package com.example.gym_app.classes.controller;

import com.example.gym_app.classes.dto.GymClassRequestDTO;
import com.example.gym_app.classes.dto.GymClassResponseDTO;
import com.example.gym_app.classes.service.GymClassService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin(origins = "http://localhost:5173")
public class GymClassController {

    private final GymClassService gymClassService;

    public GymClassController(
            GymClassService gymClassService) {
        this.gymClassService = gymClassService;
    }

    @GetMapping
    public List<GymClassResponseDTO> getAll() {
        return gymClassService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GymClassResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(gymClassService.findById(id));
    }

    @PostMapping
    public ResponseEntity<GymClassResponseDTO> create(@Valid @RequestBody GymClassRequestDTO dto) {
        return ResponseEntity.ok(gymClassService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GymClassResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody GymClassRequestDTO dto) {
        return ResponseEntity.ok(gymClassService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        gymClassService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
