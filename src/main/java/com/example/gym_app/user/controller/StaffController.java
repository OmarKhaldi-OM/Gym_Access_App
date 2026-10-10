package com.example.gym_app.user.controller;

import com.example.gym_app.user.dto.StaffRequestDTO;
import com.example.gym_app.user.dto.StaffResponseDTO;
import com.example.gym_app.user.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "http://localhost:5173")
public class StaffController {

    private final StaffService staffService;

    public StaffController(
            StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public List<StaffResponseDTO> getAll() {
        return staffService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(staffService.findById(id));
    }

    @PostMapping
    public ResponseEntity<StaffResponseDTO> create(@Valid @RequestBody StaffRequestDTO dto) {
        return ResponseEntity.ok(staffService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody StaffRequestDTO dto) {
        return ResponseEntity.ok(staffService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        staffService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
