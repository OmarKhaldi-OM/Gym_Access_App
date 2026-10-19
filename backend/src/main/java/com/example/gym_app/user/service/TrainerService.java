package com.example.gym_app.user.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.dto.TrainerRequestDTO;
import com.example.gym_app.user.dto.TrainerResponseDTO;
import com.example.gym_app.user.dto.TrainerUpdateRequestDTO;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.TrainerRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Locale;

@Service
public class TrainerService {

    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    public TrainerService(
            TrainerRepository trainerRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SecurityUtil securityUtil) {
        this.trainerRepository = trainerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtil = securityUtil;
    }

    private TrainerResponseDTO toDTO(Trainer trainer) {
        TrainerResponseDTO dto = new TrainerResponseDTO();
        dto.setId(trainer.getId());
        dto.setNom(trainer.getNom());
        dto.setPrenom(trainer.getPrenom());
        dto.setEmail(trainer.getEmail());
        dto.setDateEmbauche(trainer.getDateEmbauche());
        dto.setSpecialite(trainer.getSpecialite());
        return dto;
    }

    private Trainer toEntity(TrainerRequestDTO dto) {
        Trainer trainer = new Trainer();
        trainer.setNom(dto.getNom());
        trainer.setPrenom(dto.getPrenom());
        trainer.setEmail(normalizeEmail(dto.getEmail()));
        trainer.setTelephone(dto.getTelephone());
        trainer.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        trainer.setRole(Role.TRAINER);
        trainer.setDateEmbauche(dto.getDateEmbauche());
        trainer.setSpecialite(dto.getSpecialite());
        trainer.setDateCreation(LocalDateTime.now());
        return trainer;
    }

    public List<TrainerResponseDTO> findAll() {
        securityUtil.requireRole(Role.values());
        return trainerRepository.findAll().stream().map(this::toDTO).toList();
    }

    public TrainerResponseDTO findById(UUID id) {
        securityUtil.requireRole(Role.values());
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer introuvable avec id: " + id));
        return toDTO(trainer);
    }

    public TrainerResponseDTO create(TrainerRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        requireEmailAvailable(dto.getEmail(), null);
        return toDTO(trainerRepository.save(toEntity(dto)));
    }

    public TrainerResponseDTO update(UUID id, TrainerUpdateRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        Trainer existing = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer introuvable avec id: " + id));
        requireEmailAvailable(dto.getEmail(), id);
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(normalizeEmail(dto.getEmail()));
        existing.setTelephone(dto.getTelephone());
        existing.setDateEmbauche(dto.getDateEmbauche());
        existing.setSpecialite(dto.getSpecialite());
        return toDTO(trainerRepository.save(existing));
    }

    public void delete(UUID id) {
        securityUtil.requireRole(Role.ADMIN);
        Trainer trainer = trainerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer introuvable avec id: " + id));
        trainerRepository.delete(trainer);
    }

    private void requireEmailAvailable(String email, UUID currentId) {
        userRepository.findByEmailIgnoreCase(normalizeEmail(email)).ifPresent(existing -> {
            if (!existing.getId().equals(currentId)) {
                throw new ConflictException("Cette adresse email est deja utilisee");
            }
        });
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
