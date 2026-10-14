package com.example.gym_app.classes.controller;

import com.example.gym_app.classes.dto.ClassScheduleRequestDTO;
import com.example.gym_app.classes.dto.ClassScheduleResponseDTO;
import com.example.gym_app.classes.service.ClassScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "http://localhost:5173")
public class ClassScheduleController {

    private final ClassScheduleService classScheduleService;

    public ClassScheduleController(
            ClassScheduleService classScheduleService) {
        this.classScheduleService = classScheduleService;
    }

    @GetMapping
    public List<ClassScheduleResponseDTO> getAll() {
        return classScheduleService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassScheduleResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(classScheduleService.findById(id));
    }

    @GetMapping("/trainer/{trainerId}")
    public List<ClassScheduleResponseDTO> getByTrainer(@PathVariable UUID trainerId) {
        return classScheduleService.findByTrainer(trainerId);
    }

    @PostMapping
    public ResponseEntity<ClassScheduleResponseDTO> create(@Valid @RequestBody ClassScheduleRequestDTO dto) {
        return ResponseEntity.ok(classScheduleService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassScheduleResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody ClassScheduleRequestDTO dto) {
        return ResponseEntity.ok(classScheduleService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        classScheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
