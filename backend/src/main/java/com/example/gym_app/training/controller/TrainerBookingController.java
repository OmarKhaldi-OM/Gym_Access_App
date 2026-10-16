package com.example.gym_app.training.controller;

import com.example.gym_app.training.dto.TrainerBookingRequestDTO;
import com.example.gym_app.training.dto.TrainerBookingResponseDTO;
import com.example.gym_app.training.service.TrainerBookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trainer-bookings")
public class TrainerBookingController {

    private final TrainerBookingService trainerBookingService;

    public TrainerBookingController(
            TrainerBookingService trainerBookingService) {
        this.trainerBookingService = trainerBookingService;
    }

    @GetMapping
    public List<TrainerBookingResponseDTO> getAll() {
        return trainerBookingService.findAll();
    }

    @GetMapping("/member/{memberId}")
    public List<TrainerBookingResponseDTO> getByMember(@PathVariable("memberId") UUID memberId) {
        return trainerBookingService.findByMember(memberId);
    }

    @GetMapping("/trainer/{trainerId}")
    public List<TrainerBookingResponseDTO> getByTrainer(@PathVariable("trainerId") UUID trainerId) {
        return trainerBookingService.findByTrainer(trainerId);
    }

    @PostMapping
    public ResponseEntity<TrainerBookingResponseDTO> create(@Valid @RequestBody TrainerBookingRequestDTO dto) {
        return ResponseEntity.ok(trainerBookingService.create(dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TrainerBookingResponseDTO> cancel(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(trainerBookingService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        trainerBookingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
