package com.example.gym_app.training.service;

import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.dto.CoachingRequestStatusDTO;
import com.example.gym_app.training.entity.CoachingRequest;
import com.example.gym_app.training.entity.Trainer_Booking;
import com.example.gym_app.training.repository.CoachingRequestRepository;
import com.example.gym_app.training.repository.TrainerBookingRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.TrainerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class CoachingRequestServiceTest {

    @Mock
    private CoachingRequestRepository requestRepository;
    @Mock
    private TrainerBookingRepository trainerBookingRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private TrainerRepository trainerRepository;
    @Mock
    private SecurityUtil securityUtil;

    private CoachingRequestService coachingRequestService;
    private CoachingRequest request;

    @BeforeEach
    void setUp() {
        coachingRequestService = new CoachingRequestService(
                requestRepository, trainerBookingRepository, memberRepository, trainerRepository, securityUtil);
        Member member = new Member();
        member.setId(UUID.randomUUID());
        member.setEmail("member@example.com");
        member.setNom("Member");
        member.setPrenom("Test");
        Trainer trainer = new Trainer();
        trainer.setId(UUID.randomUUID());
        trainer.setEmail("trainer@example.com");
        trainer.setNom("Trainer");
        trainer.setPrenom("Test");

        request = new CoachingRequest();
        request.setId(UUID.randomUUID());
        request.setMember(member);
        request.setTrainer(trainer);
        request.setRequestedAt(LocalDateTime.now().plusDays(1));
        request.setGoal("Improve strength");
        request.setStatus("PENDING");
        lenient().when(requestRepository.findById(request.getId())).thenReturn(Optional.of(request));
    }

    @Test
    void acceptsPendingRequestAndCreatesConfirmedTrainerBooking() {
        allowTrainerDecision();
        stubRequestSave();
        when(trainerBookingRepository.findByTrainerId(request.getTrainer().getId())).thenReturn(List.of());
        when(trainerBookingRepository.save(any(Trainer_Booking.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = coachingRequestService.updateStatus(request.getId(), status("ACCEPTED"));

        ArgumentCaptor<Trainer_Booking> savedBooking = ArgumentCaptor.forClass(Trainer_Booking.class);
        verify(trainerBookingRepository).save(savedBooking.capture());
        assertEquals("ACCEPTED", response.getStatus());
        assertEquals("CONFIRMED", savedBooking.getValue().getStatut());
        assertEquals(request.getMember(), savedBooking.getValue().getMember());
        assertEquals(request.getTrainer(), savedBooking.getValue().getTrainer());
        verify(requestRepository).save(request);
    }

    @Test
    void rejectsPendingRequest() {
        allowTrainerDecision();
        stubRequestSave();

        var response = coachingRequestService.updateStatus(request.getId(), status("REJECTED"));

        assertEquals("REJECTED", response.getStatus());
        verify(requestRepository).save(request);
        verify(trainerBookingRepository, never()).save(any(Trainer_Booking.class));
    }

    @Test
    void cancelsPendingRequestByItsMember() {
        allowMemberCancellation();
        stubRequestSave();

        var response = coachingRequestService.updateStatus(request.getId(), status("CANCELLED"));

        assertEquals("CANCELLED", response.getStatus());
        verify(requestRepository).save(request);
        verify(trainerBookingRepository, never()).save(any(Trainer_Booking.class));
    }

    @Test
    void trainerRequestListHidesArchivedPendingRequestsButKeepsHistory() {
        Member archivedMember = new Member();
        archivedMember.setId(UUID.randomUUID());
        archivedMember.setArchived(true);
        Member activeMember = new Member();
        activeMember.setId(UUID.randomUUID());
        Trainer trainer = request.getTrainer();

        CoachingRequest archivedPending = requestFor(archivedMember, trainer, "PENDING");
        CoachingRequest archivedHistory = requestFor(archivedMember, trainer, "ACCEPTED");
        CoachingRequest activePending = requestFor(activeMember, trainer, "PENDING");
        when(securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)).thenReturn(false);
        when(trainerRepository.findById(trainer.getId())).thenReturn(Optional.of(trainer));
        when(securityUtil.isCurrentUser(trainer.getEmail())).thenReturn(true);
        when(requestRepository.findByTrainerIdOrderByCreatedAtDesc(trainer.getId()))
                .thenReturn(List.of(archivedPending, archivedHistory, activePending));

        var requests = coachingRequestService.findByTrainer(trainer.getId());

        assertEquals(List.of("ACCEPTED", "PENDING"),
                requests.stream().map(item -> item.getStatus()).toList());
        assertTrue(requests.get(0).isMemberArchived());
        assertFalse(requests.get(1).isMemberArchived());
    }

    @ParameterizedTest
    @ValueSource(strings = {"ACCEPTED", "REJECTED", "CANCELLED"})
    void refusesFurtherTransitionsAfterRequestIsProcessed(String currentStatus) {
        request.setStatus(currentStatus);
        if ("CANCELLED".equals(currentStatus)) {
            allowMemberCancellation();
        } else {
            allowTrainerDecision();
        }

        String nextStatus = "CANCELLED".equals(currentStatus) ? "CANCELLED" : "REJECTED";
        assertThrows(ConflictException.class,
                () -> coachingRequestService.updateStatus(request.getId(), status(nextStatus)));

        verify(requestRepository, never()).save(any(CoachingRequest.class));
        verify(trainerBookingRepository, never()).save(any(Trainer_Booking.class));
    }

    @ParameterizedTest
    @ValueSource(strings = {"PENDING", "UNKNOWN"})
    void refusesUnsupportedTargetStatus(String targetStatus) {
        allowTrainerDecision();

        assertThrows(ConflictException.class,
                () -> coachingRequestService.updateStatus(request.getId(), status(targetStatus)));

        verify(requestRepository, never()).save(any(CoachingRequest.class));
        verify(trainerBookingRepository, never()).save(any(Trainer_Booking.class));
    }

    private void allowTrainerDecision() {
        when(securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)).thenReturn(false);
        when(securityUtil.hasRole(any(Role.class)))
                .thenAnswer(invocation -> invocation.getArgument(0) == Role.TRAINER);
        when(securityUtil.isCurrentUser(request.getTrainer().getEmail())).thenReturn(true);
    }

    private void allowMemberCancellation() {
        when(securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)).thenReturn(false);
        when(securityUtil.hasRole(any(Role.class)))
                .thenAnswer(invocation -> invocation.getArgument(0) == Role.MEMBER);
        when(securityUtil.isCurrentUser(request.getMember().getEmail())).thenReturn(true);
    }

    private void stubRequestSave() {
        when(requestRepository.save(any(CoachingRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    private CoachingRequestStatusDTO status(String value) {
        CoachingRequestStatusDTO dto = new CoachingRequestStatusDTO();
        dto.setStatus(value);
        dto.setResponse("Test response");
        return dto;
    }

    private CoachingRequest requestFor(Member member, Trainer trainer, String status) {
        CoachingRequest result = new CoachingRequest();
        result.setMember(member);
        result.setTrainer(trainer);
        result.setStatus(status);
        result.setRequestedAt(LocalDateTime.now().plusDays(1));
        result.setGoal("Improve strength");
        result.setCreatedAt(LocalDateTime.now());
        return result;
    }
}
