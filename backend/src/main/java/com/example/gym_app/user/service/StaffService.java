package com.example.gym_app.user.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.dto.StaffPasswordResetRequestDTO;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.dto.StaffRequestDTO;
import com.example.gym_app.user.dto.StaffResponseDTO;
import com.example.gym_app.user.dto.StaffUpdateRequestDTO;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.StaffRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.Locale;

@Service
public class StaffService {

    private static final Logger logger = LoggerFactory.getLogger(StaffService.class);

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    public StaffService(
            StaffRepository staffRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            SecurityUtil securityUtil) {
        this.staffRepository = staffRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtil = securityUtil;
    }

    private StaffResponseDTO toDTO(Staff staff) {
        StaffResponseDTO dto = new StaffResponseDTO();
        dto.setId(staff.getId());
        dto.setNom(staff.getNom());
        dto.setPrenom(staff.getPrenom());
        dto.setEmail(staff.getEmail());
        dto.setTelephone(staff.getTelephone());
        dto.setRole(staff.getRole());
        dto.setDateEmbauche(staff.getDateEmbauche());
        if (staff instanceof Trainer trainer) {
            dto.setSpecialite(trainer.getSpecialite());
        }
        return dto;
    }

    private Staff toEntity(StaffRequestDTO dto) {
        Staff staff = new Staff();
        staff.setNom(dto.getNom());
        staff.setPrenom(dto.getPrenom());
        staff.setEmail(normalizeEmail(dto.getEmail()));
        staff.setTelephone(dto.getTelephone());
        staff.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        staff.setRole(Role.RECEPTIONIST);
        staff.setDateEmbauche(dto.getDateEmbauche());
        staff.setDateCreation(LocalDateTime.now());
        return staff;
    }

    public List<StaffResponseDTO> findAll() {
        securityUtil.requireRole(Role.ADMIN);
        return staffRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public StaffResponseDTO findById(UUID id) {
        securityUtil.requireRole(Role.ADMIN);
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff introuvable avec id: " + id));
        return toDTO(staff);
    }

    public StaffResponseDTO create(StaffRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        if (dto.getRole() != Role.RECEPTIONIST) {
            throw new BadRequestException("Seul le role RECEPTIONIST peut etre cree par cet endpoint");
        }
        requireEmailAvailable(dto.getEmail(), null);
        return toDTO(staffRepository.save(toEntity(dto)));
    }

    public StaffResponseDTO update(UUID id, StaffUpdateRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        Staff existing = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff introuvable avec id: " + id));
        requireReceptionist(existing);
        requireEmailAvailable(dto.getEmail(), id);
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(normalizeEmail(dto.getEmail()));
        existing.setTelephone(dto.getTelephone());
        existing.setDateEmbauche(dto.getDateEmbauche());
        return toDTO(staffRepository.save(existing));
    }

    public void delete(UUID id) {
        securityUtil.requireRole(Role.ADMIN);
        Staff existing = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff introuvable avec id: " + id));
        requireReceptionist(existing);
        staffRepository.delete(existing);
    }

    public void resetPassword(UUID id, StaffPasswordResetRequestDTO request) {
        securityUtil.requireRole(Role.ADMIN);
        var target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte introuvable"));
        if (target.getRole() != Role.RECEPTIONIST && target.getRole() != Role.TRAINER) {
            throw new AccessDeniedException("Réinitialisation interdite pour ce compte");
        }
        target.setMotDePasse(passwordEncoder.encode(request.getNewPassword()));
        target.setPasswordChangedAt(LocalDateTime.now().truncatedTo(ChronoUnit.MILLIS));
        userRepository.save(target);
        logger.info("Admin reset password for staff account id={}", id);
    }

    private void requireReceptionist(Staff staff) {
        if (staff.getRole() != Role.RECEPTIONIST) {
            throw new ResourceNotFoundException("Staff introuvable");
        }
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
