package com.example.gym_app.security;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.security.dto.LoginRequestDTO;
import com.example.gym_app.security.dto.RegisterRequestDTO;
import com.example.gym_app.security.dto.CurrentUserDTO;
import com.example.gym_app.security.dto.CurrentUserUpdateDTO;
import com.example.gym_app.user.entity.User;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/auth")
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

    @Autowired
    private ProfilePhotoStorageService profilePhotoStorageService;

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

    @GetMapping("/me")
    public ResponseEntity<CurrentUserDTO> currentUser() {
        User user = userRepository.findByEmail(
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
        return ResponseEntity.ok(toCurrentUserDTO(user, null));
    }

    @PutMapping("/me")
    public ResponseEntity<CurrentUserDTO> updateCurrentUser(@Valid @RequestBody CurrentUserUpdateDTO dto) {
        String currentEmail = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
        var existingEmail = userRepository.findByEmail(dto.getEmail());
        if (existingEmail.isPresent() && !existingEmail.get().getId().equals(user.getId())) {
            throw new BadRequestException("Un compte existe deja avec cet email");
        }
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());
        user.setTelephone(dto.getTelephone());
        user.setBio(dto.getBio());
        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(toCurrentUserDTO(user, token));
    }

    @PutMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CurrentUserDTO> updateProfilePhoto(@RequestParam("file") MultipartFile file) {
        User user = currentUserEntity();
        String previousFilename = user.getProfilePhotoFilename();
        user.setProfilePhotoFilename(profilePhotoStorageService.store(file));
        user = userRepository.save(user);
        profilePhotoStorageService.delete(previousFilename);
        return ResponseEntity.ok(toCurrentUserDTO(user, null));
    }

    @GetMapping("/me/photo")
    public ResponseEntity<Resource> getProfilePhoto() {
        User user = currentUserEntity();
        String filename = user.getProfilePhotoFilename();
        if (filename == null) throw new com.example.gym_app.exception.ResourceNotFoundException("Aucune photo de profil");
        Path path = profilePhotoStorageService.pathFor(filename);
        if (!Files.isRegularFile(path)) throw new com.example.gym_app.exception.ResourceNotFoundException("Photo de profil introuvable");
        return ResponseEntity.ok()
                .contentType(profilePhotoStorageService.mediaType(filename))
                .cacheControl(CacheControl.noCache())
                .body(new FileSystemResource(path));
    }

    @DeleteMapping("/me/photo")
    public ResponseEntity<CurrentUserDTO> deleteProfilePhoto() {
        User user = currentUserEntity();
        profilePhotoStorageService.delete(user.getProfilePhotoFilename());
        user.setProfilePhotoFilename(null);
        user = userRepository.save(user);
        return ResponseEntity.ok(toCurrentUserDTO(user, null));
    }

    private User currentUserEntity() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new BadRequestException("Utilisateur introuvable"));
    }

    private CurrentUserDTO toCurrentUserDTO(User user, String token) {
        return new CurrentUserDTO(user.getId(), user.getNom(), user.getPrenom(), user.getEmail(), user.getRole().name(),
                user.getTelephone(), user.getBio(), user.getProfilePhotoFilename() != null, token);
    }
}