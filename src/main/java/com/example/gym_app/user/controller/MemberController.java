package com.example.gym_app.user.controller;

import com.example.gym_app.user.dto.MemberRequestDTO;
import com.example.gym_app.user.dto.MemberResponseDTO;
import com.example.gym_app.user.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "http://localhost:8080")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @GetMapping
    public List<MemberResponseDTO> getAll() {
        return memberService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.findById(id));
    }

    @PostMapping
    public ResponseEntity<MemberResponseDTO> create(@Valid @RequestBody MemberRequestDTO dto) {
        return ResponseEntity.ok(memberService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponseDTO> update(@PathVariable UUID id,@Valid @RequestBody MemberRequestDTO dto) {
        return ResponseEntity.ok(memberService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        memberService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
