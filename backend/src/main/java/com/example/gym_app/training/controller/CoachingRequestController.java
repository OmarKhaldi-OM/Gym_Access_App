package com.example.gym_app.training.controller;

import com.example.gym_app.training.dto.CoachingRequestCreateDTO;
import com.example.gym_app.training.dto.CoachingRequestResponseDTO;
import com.example.gym_app.training.dto.CoachingRequestStatusDTO;
import com.example.gym_app.training.service.CoachingRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/coaching-requests")
public class CoachingRequestController {
    private final CoachingRequestService requestService;

    public CoachingRequestController(CoachingRequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping("/member/{memberId}")
    public List<CoachingRequestResponseDTO> getByMember(@PathVariable("memberId") UUID memberId) {
        return requestService.findByMember(memberId);
    }

    @GetMapping("/trainer/{trainerId}")
    public List<CoachingRequestResponseDTO> getByTrainer(@PathVariable("trainerId") UUID trainerId) {
        return requestService.findByTrainer(trainerId);
    }

    @PostMapping
    public ResponseEntity<CoachingRequestResponseDTO> create(@Valid @RequestBody CoachingRequestCreateDTO dto) {
        return ResponseEntity.ok(requestService.create(dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CoachingRequestResponseDTO> updateStatus(@PathVariable("id") UUID id,
                                                                   @Valid @RequestBody CoachingRequestStatusDTO dto) {
        return ResponseEntity.ok(requestService.updateStatus(id, dto));
    }
}