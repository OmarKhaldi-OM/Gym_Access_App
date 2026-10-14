package com.example.gym_app.user.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.dto.StaffRequestDTO;
import com.example.gym_app.user.dto.StaffResponseDTO;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.repository.StaffRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;

    public StaffService(
            StaffRepository staffRepository,
            PasswordEncoder passwordEncoder,
            SecurityUtil securityUtil) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtil = securityUtil;
    }

    private StaffResponseDTO toDTO(Staff staff) {
        StaffResponseDTO dto = new StaffResponseDTO();
        dto.setId(staff.getId());
        dto.setNom(staff.getNom());
        dto.setPrenom(staff.getPrenom());
        dto.setEmail(staff.getEmail());
        dto.setRole(staff.getRole());
        dto.setDateEmbauche(staff.getDateEmbauche());
        return dto;
    }

    private Staff toEntity(StaffRequestDTO dto) {
        Staff staff = new Staff();
        staff.setNom(dto.getNom());
        staff.setPrenom(dto.getPrenom());
        staff.setEmail(dto.getEmail());
        staff.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        staff.setRole(dto.getRole());
        staff.setDateEmbauche(dto.getDateEmbauche());
        staff.setDateCreation(LocalDateTime.now());
        return staff;
    }

    public List<StaffResponseDTO> findAll() {
        securityUtil.requireRole(Role.ADMIN);
        return staffRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public StaffResponseDTO findById(UUID id) {
        securityUtil.requireRole(Role.ADMIN);
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff introuvable avec id: " + id));
        return toDTO(staff);
    }

    public StaffResponseDTO create(StaffRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        return toDTO(staffRepository.save(toEntity(dto)));
    }

    public StaffResponseDTO update(UUID id, StaffRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        Staff existing = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff introuvable avec id: " + id));
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(dto.getEmail());
        existing.setRole(dto.getRole());
        existing.setDateEmbauche(dto.getDateEmbauche());
        return toDTO(staffRepository.save(existing));
    }

    public void delete(UUID id) {
        securityUtil.requireRole(Role.ADMIN);
        staffRepository.deleteById(id);
    }
}
