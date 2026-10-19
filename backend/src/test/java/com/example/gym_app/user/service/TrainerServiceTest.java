package com.example.gym_app.user.service;

import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.dto.TrainerRequestDTO;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.TrainerRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrainerServiceTest {

    @Mock private TrainerRepository trainerRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private SecurityUtil securityUtil;

    private TrainerService trainerService;

    @BeforeEach
    void setUp() {
        trainerService = new TrainerService(trainerRepository, userRepository, passwordEncoder, securityUtil);
    }

    @Test
    void createsTrainerWithFixedRoleAndHashedPassword() {
        TrainerRequestDTO request = new TrainerRequestDTO();
        request.setNom("Ben Ali");
        request.setPrenom("Youssef");
        request.setEmail("YOUSSEF@example.com");
        request.setTelephone("12345678");
        request.setMotDePasse("initial-password");
        request.setDateEmbauche(LocalDate.of(2026, 1, 1));
        request.setSpecialite("Strength");
        when(userRepository.findByEmailIgnoreCase("youssef@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("initial-password")).thenReturn("bcrypt-hash");
        when(trainerRepository.save(any(Trainer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = trainerService.create(request);

        assertEquals("youssef@example.com", response.getEmail());
        var trainerCaptor = forClass(Trainer.class);
        verify(trainerRepository).save(trainerCaptor.capture());
        assertEquals(Role.TRAINER, trainerCaptor.getValue().getRole());
        assertEquals("bcrypt-hash", trainerCaptor.getValue().getMotDePasse());
        assertEquals("12345678", trainerCaptor.getValue().getTelephone());
        verify(passwordEncoder).encode("initial-password");
    }
}
