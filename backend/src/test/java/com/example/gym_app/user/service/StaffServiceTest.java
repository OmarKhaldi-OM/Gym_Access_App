package com.example.gym_app.user.service;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.dto.StaffRequestDTO;
import com.example.gym_app.user.dto.StaffUpdateRequestDTO;
import com.example.gym_app.user.dto.StaffPasswordResetRequestDTO;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.entity.User;
import com.example.gym_app.user.repository.StaffRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StaffServiceTest {

    @Mock private StaffRepository staffRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private SecurityUtil securityUtil;

    private StaffService staffService;

    @BeforeEach
    void setUp() {
        staffService = new StaffService(staffRepository, userRepository, passwordEncoder, securityUtil);
    }

    @Test
    void createsOnlyReceptionistsAndReturnsNoPassword() {
        StaffRequestDTO request = new StaffRequestDTO();
        request.setNom("Khaldi");
        request.setPrenom("Meriem");
        request.setEmail(" MERIEM@example.com ");
        request.setTelephone("12345678");
        request.setMotDePasse("initial-password");
        request.setRole(Role.RECEPTIONIST);
        request.setDateEmbauche(LocalDate.of(2026, 1, 1));
        when(userRepository.findByEmailIgnoreCase("meriem@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("initial-password")).thenReturn("bcrypt-hash");
        when(staffRepository.save(any(Staff.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = staffService.create(request);

        assertEquals("meriem@example.com", response.getEmail());
        assertEquals("12345678", response.getTelephone());
        assertEquals(Role.RECEPTIONIST, response.getRole());
        verify(passwordEncoder).encode("initial-password");
    }

    @Test
    void rejectsCreationWithAnElevatedOrDifferentRole() {
        StaffRequestDTO request = new StaffRequestDTO();
        request.setRole(Role.ADMIN);

        assertThrows(BadRequestException.class, () -> staffService.create(request));
        verify(staffRepository, never()).save(any());
    }

    @Test
    void rejectsAnEmailAlreadyUsedByAnyUser() {
        StaffRequestDTO request = new StaffRequestDTO();
        request.setEmail("existing@example.com");
        request.setRole(Role.RECEPTIONIST);
        Staff existing = new Staff();
        existing.setId(UUID.randomUUID());
        when(userRepository.findByEmailIgnoreCase("existing@example.com")).thenReturn(Optional.of(existing));

        assertThrows(ConflictException.class, () -> staffService.create(request));
        verify(staffRepository, never()).save(any());
    }

    @Test
    void adminStaffCollectionIncludesBothStaffRoles() {
        Staff receptionist = new Staff();
        receptionist.setRole(Role.RECEPTIONIST);
        Trainer trainer = new Trainer();
        trainer.setRole(Role.TRAINER);
        when(staffRepository.findAll()).thenReturn(List.of(receptionist, trainer));

        assertEquals(2, staffService.findAll().size());
    }

    @Test
    void staffEndpointCanReadTrainerDetailsButCannotMutateTrainerRows() {
        UUID trainerId = UUID.randomUUID();
        Trainer trainer = new Trainer();
        trainer.setId(trainerId);
        trainer.setRole(Role.TRAINER);
        when(staffRepository.findById(trainerId)).thenReturn(Optional.of(trainer));

        assertEquals(Role.TRAINER, staffService.findById(trainerId).getRole());
        assertThrows(ResourceNotFoundException.class, () -> staffService.delete(trainerId));
        StaffUpdateRequestDTO request = new StaffUpdateRequestDTO();
        assertThrows(ResourceNotFoundException.class, () -> staffService.update(trainerId, request));
        verify(staffRepository, never()).delete(any());
    }

    @Test
    void updatesReceptionistFieldsWithoutChangingPasswordOrRole() {
        UUID id = UUID.randomUUID();
        Staff existing = new Staff();
        existing.setId(id);
        existing.setRole(Role.RECEPTIONIST);
        existing.setEmail("old@example.com");
        when(staffRepository.findById(id)).thenReturn(Optional.of(existing));
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
        when(staffRepository.save(existing)).thenReturn(existing);

        StaffUpdateRequestDTO request = new StaffUpdateRequestDTO();
        request.setNom("New");
        request.setPrenom("Name");
        request.setEmail("new@example.com");
        request.setTelephone("555");
        request.setDateEmbauche(LocalDate.of(2026, 1, 1));

        var response = staffService.update(id, request);

        assertEquals(Role.RECEPTIONIST, existing.getRole());
        assertEquals("555", response.getTelephone());
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void resetsOnlyReceptionistOrTrainerPasswordAndRecordsChangeTime() {
        UUID id = UUID.randomUUID();
        Staff receptionist = new Staff();
        receptionist.setId(id);
        receptionist.setRole(Role.RECEPTIONIST);
        when(userRepository.findById(id)).thenReturn(Optional.of(receptionist));
        when(passwordEncoder.encode("new-password-10")).thenReturn("bcrypt-hash");

        StaffPasswordResetRequestDTO request = new StaffPasswordResetRequestDTO();
        request.setNewPassword("new-password-10");
        staffService.resetPassword(id, request);

        assertEquals("bcrypt-hash", receptionist.getMotDePasse());
        org.junit.jupiter.api.Assertions.assertNotNull(receptionist.getPasswordChangedAt());
        verify(userRepository).save(receptionist);
        verify(passwordEncoder).encode("new-password-10");
    }

    @Test
    void refusesToResetAnAdminPassword() {
        UUID id = UUID.randomUUID();
        User admin = new Staff();
        admin.setId(id);
        admin.setRole(Role.ADMIN);
        when(userRepository.findById(id)).thenReturn(Optional.of(admin));

        StaffPasswordResetRequestDTO request = new StaffPasswordResetRequestDTO();
        request.setNewPassword("new-password-10");

        assertThrows(AccessDeniedException.class, () -> staffService.resetPassword(id, request));
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void resetsTrainerPassword() {
        UUID id = UUID.randomUUID();
        Trainer trainer = new Trainer();
        trainer.setId(id);
        trainer.setRole(Role.TRAINER);
        when(userRepository.findById(id)).thenReturn(Optional.of(trainer));
        when(passwordEncoder.encode("new-password-10")).thenReturn("bcrypt-hash");

        StaffPasswordResetRequestDTO request = new StaffPasswordResetRequestDTO();
        request.setNewPassword("new-password-10");

        staffService.resetPassword(id, request);

        assertEquals("bcrypt-hash", trainer.getMotDePasse());
        org.junit.jupiter.api.Assertions.assertNotNull(trainer.getPasswordChangedAt());
        verify(userRepository).save(trainer);
    }
}
