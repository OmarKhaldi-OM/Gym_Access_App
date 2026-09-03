package com.example.gym_app.security;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.security.dto.LoginRequestDTO;
import com.example.gym_app.security.dto.RegisterRequestDTO;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    // Inscription publique : uniquement pour les Members. Staff/Trainer sont crees par un ADMIN
    // via /api/staff et /api/trainers une fois l'authentification en place.
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Un compte existe deja avec cet email");
        }

        Member member = new Member();
        member.setNom(dto.getNom());
        member.setPrenom(dto.getPrenom());
        member.setEmail(dto.getEmail());
        member.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        member.setRole(Role.MEMBER);
        member.setDateNaissance(dto.getDateNaissance());
        member.setDateInscription(LocalDateTime.now());
        member.setDateCreation(LocalDateTime.now());

        memberRepository.save(member);

        String token = jwtUtil.generateToken(member.getEmail(), member.getRole().name());
        return ResponseEntity.ok(new AuthResponseDTO(token, member.getEmail(), member.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getMotDePasse())
        );

        var user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadRequestException("Email ou mot de passe incorrect"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponseDTO(token, user.getEmail(), user.getRole().name()));
    }
}