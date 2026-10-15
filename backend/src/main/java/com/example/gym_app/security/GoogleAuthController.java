package com.example.gym_app.security;

import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.security.dto.GoogleAuthRequestDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping
    public ResponseEntity<AuthResponseDTO> authenticate(@Valid @RequestBody GoogleAuthRequestDTO request) {
        return ResponseEntity.ok(googleAuthService.authenticate(request.getCredential()));
    }

    @PostMapping("/link")
    public ResponseEntity<Void> link(Authentication authentication, @Valid @RequestBody GoogleAuthRequestDTO request) {
        googleAuthService.link(authentication.getName(), request.getCredential());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/link/status")
    public ResponseEntity<Map<String, Boolean>> linkStatus(Authentication authentication) {
        return ResponseEntity.ok(Map.of("linked", googleAuthService.isLinked(authentication.getName())));
    }
}
