package com.example.gym_app.training.controller;

import com.example.gym_app.training.dto.TrainerBookingRequestDTO;
import com.example.gym_app.training.dto.TrainerBookingResponseDTO;
import com.example.gym_app.training.service.TrainerBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainer-bookings")
@CrossOrigin(origins = "http://localhost:8080")
public class TrainerBookingController {

    @Autowired
    private TrainerBookingService trainerBookingService;

    @GetMapping
    public List<TrainerBookingResponseDTO> getAll() {
        return trainerBookingService.findAll();
    }

    @GetMapping("/member/{memberId}")
    public List<TrainerBookingResponseDTO> getByMember(@PathVariable UUID memberId) {
        return trainerBookingService.findByMember(memberId);
    }

    @GetMapping("/trainer/{trainerId}")
    public List<TrainerBookingResponseDTO> getByTrainer(@PathVariable UUID trainerId) {
        return trainerBookingService.findByTrainer(trainerId);
    }

    @PostMapping
    public ResponseEntity<TrainerBookingResponseDTO> create(@Valid @RequestBody TrainerBookingRequestDTO dto) {
        return ResponseEntity.ok(trainerBookingService.create(dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TrainerBookingResponseDTO> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(trainerBookingService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        trainerBookingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
