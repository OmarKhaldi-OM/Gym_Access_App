package com.example.gym_app.training.controller;

import com.example.gym_app.training.dto.MemberGoalDTO;
import com.example.gym_app.training.service.MemberGoalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/member-goals")
@CrossOrigin(origins = "http://localhost:5173")
public class MemberGoalController {
    private final MemberGoalService goalService;

    public MemberGoalController(MemberGoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping("/member/{memberId}")
    public List<MemberGoalDTO> getByMember(@PathVariable("memberId") UUID memberId) {
        return goalService.findByMember(memberId);
    }

    @PostMapping("/member/{memberId}")
    public ResponseEntity<MemberGoalDTO> create(@PathVariable("memberId") UUID memberId, @Valid @RequestBody MemberGoalDTO dto) {
        return ResponseEntity.ok(goalService.create(memberId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberGoalDTO> update(@PathVariable("id") UUID id, @Valid @RequestBody MemberGoalDTO dto) {
        return ResponseEntity.ok(goalService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") UUID id) {
        goalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}