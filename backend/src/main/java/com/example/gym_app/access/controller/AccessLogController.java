package com.example.gym_app.access.controller;

import com.example.gym_app.access.dto.AccessLogRequestDTO;
import com.example.gym_app.access.dto.AccessLogResponseDTO;
import com.example.gym_app.access.service.AccessLogService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/access-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class AccessLogController {

    private final AccessLogService accessLogService;

    public AccessLogController(
            AccessLogService accessLogService) {
        this.accessLogService = accessLogService;
    }

    @GetMapping
    public List<AccessLogResponseDTO> getAll() {
        return accessLogService.findAll();
    }

    @GetMapping("/member/{memberId}")
    public List<AccessLogResponseDTO> getByMember(@PathVariable UUID memberId) {
        return accessLogService.findByMember(memberId);
    }

    @GetMapping("/periode")
    public List<AccessLogResponseDTO> getByPeriode(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return accessLogService.findByPeriode(start, end);
    }

    @PostMapping
    public ResponseEntity<AccessLogResponseDTO> create(@Valid @RequestBody AccessLogRequestDTO dto) {
        return ResponseEntity.ok(accessLogService.create(dto));
    }
}
