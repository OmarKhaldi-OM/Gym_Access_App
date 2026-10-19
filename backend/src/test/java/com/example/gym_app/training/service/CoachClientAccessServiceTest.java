package com.example.gym_app.training.service;

import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.entity.CoachingRequest;
import com.example.gym_app.training.entity.Trainer_Booking;
import com.example.gym_app.training.repository.CoachingRequestRepository;
import com.example.gym_app.training.repository.TrainerBookingRepository;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.TrainerRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class CoachClientAccessServiceTest {
    @Mock
    private TrainerRepository trainerRepository;
    @Mock
    private TrainerBookingRepository trainerBookingRepository;
    @Mock
    private CoachingRequestRepository coachingRequestRepository;

    private final SecurityUtil securityUtil = new SecurityUtil();
    private CoachClientAccessService accessService;
    private Trainer trainer;
    private UUID memberId;

    @BeforeEach
    void setUp() {
        accessService = new CoachClientAccessService(
                securityUtil, trainerRepository, trainerBookingRepository, coachingRequestRepository);
        trainer = new Trainer();
        trainer.setId(UUID.randomUUID());
        trainer.setEmail("coach@example.com");
        memberId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        trainer.getEmail(), null,
                        List.of(new SimpleGrantedAuthority(Role.TRAINER.authority()))));
        lenient().when(trainerRepository.findByEmail(trainer.getEmail())).thenReturn(Optional.of(trainer));
        lenient().when(trainerBookingRepository.findByTrainerIdAndMemberId(trainer.getId(), memberId)).thenReturn(List.of());
        lenient().when(coachingRequestRepository.findByTrainerIdAndMemberId(trainer.getId(), memberId)).thenReturn(List.of());
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void allowsClientWithNonCancelledSession() {
        Trainer_Booking booking = new Trainer_Booking();
        booking.setStatut("CONFIRMED");
        when(trainerBookingRepository.findByTrainerIdAndMemberId(trainer.getId(), memberId))
                .thenReturn(List.of(booking));

        assertDoesNotThrow(() -> accessService.requireClientAccess(memberId));
    }

    @Test
    void allowsClientWithAcceptedRequest() {
        CoachingRequest request = new CoachingRequest();
        request.setStatus("ACCEPTED");
        when(coachingRequestRepository.findByTrainerIdAndMemberId(trainer.getId(), memberId))
                .thenReturn(List.of(request));

        assertDoesNotThrow(() -> accessService.requireClientAccess(memberId));
    }

    @Test
    void deniesClientWithOnlyCancelledSessionOrUnacceptedRequest() {
        Trainer_Booking booking = new Trainer_Booking();
        booking.setStatut("CANCELLED");
        CoachingRequest request = new CoachingRequest();
        request.setStatus("PENDING");
        when(trainerBookingRepository.findByTrainerIdAndMemberId(trainer.getId(), memberId))
                .thenReturn(List.of(booking));
        when(coachingRequestRepository.findByTrainerIdAndMemberId(trainer.getId(), memberId))
                .thenReturn(List.of(request));

        assertThrows(AccessDeniedException.class, () -> accessService.requireClientAccess(memberId));
    }

    @Test
    void deniesUserWithoutTrainerRole() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        trainer.getEmail(), null,
                        List.of(new SimpleGrantedAuthority(Role.MEMBER.authority()))));

        assertThrows(AccessDeniedException.class, () -> accessService.requireClientAccess(memberId));
    }
}
