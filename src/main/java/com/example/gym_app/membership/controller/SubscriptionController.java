package com.example.gym_app.membership.controller;

import com.example.gym_app.membership.dto.SubscriptionRequestDTO;
import com.example.gym_app.membership.dto.SubscriptionResponseDTO;
import com.example.gym_app.membership.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(
            SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public List<SubscriptionResponseDTO> getAll() {
        return subscriptionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.findById(id));
    }

    @GetMapping("/member/{memberId}")
    public List<SubscriptionResponseDTO> getByMember(@PathVariable UUID memberId) {
        return subscriptionService.findByMember(memberId);
    }

    @PostMapping
    public ResponseEntity<SubscriptionResponseDTO> create(@Valid @RequestBody SubscriptionRequestDTO dto) {
        return ResponseEntity.ok(subscriptionService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponseDTO> update(@PathVariable UUID id, @Valid @RequestBody SubscriptionRequestDTO dto) {
        return ResponseEntity.ok(subscriptionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        subscriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
