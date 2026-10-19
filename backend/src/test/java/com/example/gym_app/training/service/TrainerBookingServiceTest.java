package com.example.gym_app.training.service;

import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.entity.Trainer_Booking;
import com.example.gym_app.training.repository.TrainerBookingRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.TrainerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrainerBookingServiceTest {
    @Mock
    private TrainerBookingRepository trainerBookingRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private TrainerRepository trainerRepository;
    @Mock
    private SecurityUtil securityUtil;

    private TrainerBookingService service;
    private UUID trainerId;

    @BeforeEach
    void setUp() {
        service = new TrainerBookingService(
                trainerBookingRepository, memberRepository, trainerRepository, securityUtil);
        trainerId = UUID.randomUUID();
        when(securityUtil.hasAnyRole(
                com.example.gym_app.user.entity.Role.ADMIN,
                com.example.gym_app.user.entity.Role.RECEPTIONIST)).thenReturn(true);
    }

    @Test
    void clientListExcludesArchivedAndCancelledMembersWithoutHidingOtherClients() {
        Member deleted = member(UUID.randomUUID(), true);
        Member active = member(UUID.randomUUID(), false);
        Trainer_Booking archivedHistory = booking(deleted, LocalDateTime.now().minusDays(1), "CONFIRMED");
        Trainer_Booking activeBooking = booking(active, LocalDateTime.now().plusDays(1), "CONFIRMED");
        Trainer_Booking cancelledActiveBooking = booking(member(UUID.randomUUID(), false),
                LocalDateTime.now().plusDays(2), "CANCELLED");

        when(trainerBookingRepository.findByTrainerId(trainerId))
                .thenReturn(List.of(archivedHistory, activeBooking, cancelledActiveBooking));

        var clients = service.findClientsByTrainer(trainerId);

        assertEquals(1, clients.size());
        assertEquals(active.getId(), clients.get(0).getMemberId());
    }

    @Test
    void trainerScheduleKeepsPastArchivedHistoryButHidesUpcomingArchivedSessions() {
        Member deleted = member(UUID.randomUUID(), true);
        Trainer_Booking pastSession = booking(deleted, LocalDateTime.now().minusDays(1), "CONFIRMED");
        Trainer_Booking futureSession = booking(deleted, LocalDateTime.now().plusDays(1), "CONFIRMED");

        when(trainerBookingRepository.findByTrainerId(trainerId))
                .thenReturn(List.of(pastSession, futureSession));

        var sessions = service.findByTrainer(trainerId);

        assertEquals(1, sessions.size());
        assertEquals(pastSession.getId(), sessions.get(0).getId());
        assertTrue(sessions.get(0).isMemberArchived());
    }

    private Member member(UUID id, boolean archived) {
        Member member = new Member();
        member.setId(id);
        member.setArchived(archived);
        member.setNom(archived ? "Membre anonymisé" : "Client");
        member.setPrenom(archived ? "" : "Active");
        return member;
    }

    private Trainer_Booking booking(Member member, LocalDateTime dateTime, String status) {
        Trainer_Booking booking = new Trainer_Booking();
        booking.setId(UUID.randomUUID());
        booking.setMember(member);
        booking.setTrainer(new Trainer());
        booking.setDateHeure(dateTime);
        booking.setStatut(status);
        return booking;
    }
}
