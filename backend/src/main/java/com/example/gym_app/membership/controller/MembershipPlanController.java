package com.example.gym_app.membership.controller;

import com.example.gym_app.membership.dto.MembershipPlanRequestDTO;
import com.example.gym_app.membership.dto.MembershipPlanResponseDTO;
import com.example.gym_app.membership.service.MembershipPlanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/plans")
public class MembershipPlanController {

    private final MembershipPlanService membershipPlanService;

    public MembershipPlanController(
            MembershipPlanService membershipPlanService) {
        this.membershipPlanService = membershipPlanService;
    }

    @GetMapping
    public List<MembershipPlanResponseDTO> getAll() {
        return membershipPlanService.findAll();
    }

    @GetMapping("/manage")
    public List<MembershipPlanResponseDTO> getAllForManagement() {
        return membershipPlanService.findAllForManagement();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembershipPlanResponseDTO> getById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(membershipPlanService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MembershipPlanResponseDTO> create(@Valid @RequestBody MembershipPlanRequestDTO dto) {
        return ResponseEntity.ok(membershipPlanService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MembershipPlanResponseDTO> update(@PathVariable("id") UUID id, @Valid @RequestBody MembershipPlanRequestDTO dto) {
        return ResponseEntity.ok(membershipPlanService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        membershipPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
