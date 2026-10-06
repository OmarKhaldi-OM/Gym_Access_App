package com.example.gym_app.classes.controller;

import com.example.gym_app.classes.dto.BookingRequestDTO;
import com.example.gym_app.classes.dto.BookingResponseDTO;
import com.example.gym_app.classes.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public List<BookingResponseDTO> getAll() {
        return bookingService.findAll();
    }

    @GetMapping("/counts")
    public Map<UUID, Long> getCounts() {
        return bookingService.countActiveBySchedule();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.findById(id));
    }

    @GetMapping("/member/{memberId}")
    public List<BookingResponseDTO> getByMember(@PathVariable UUID memberId) {
        return bookingService.findByMember(memberId);
    }

    @PostMapping
    public ResponseEntity<BookingResponseDTO> create(@Valid @RequestBody BookingRequestDTO dto) {
        return ResponseEntity.ok(bookingService.create(dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
