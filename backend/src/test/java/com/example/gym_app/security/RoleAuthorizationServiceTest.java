package com.example.gym_app.security;

import com.example.gym_app.classes.dto.BookingRequestDTO;
import com.example.gym_app.classes.repository.BookingRepository;
import com.example.gym_app.classes.repository.ClassScheduleRepository;
import com.example.gym_app.classes.service.BookingService;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.membership.repository.SubscriptionRepository;
import com.example.gym_app.membership.service.SubscriptionService;
import com.example.gym_app.training.entity.Progress_Log;
import com.example.gym_app.training.repository.ProgressLogRepository;
import com.example.gym_app.training.service.ProgressLogService;
import com.example.gym_app.training.service.CoachClientAccessService;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoleAuthorizationServiceTest {

    private final SecurityUtil securityUtil = new SecurityUtil();

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ClassScheduleRepository classScheduleRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private MembershipPlanRepository membershipPlanRepository;

    @Mock
    private ProgressLogRepository progressLogRepository;

    @Mock
    private CoachClientAccessService coachClientAccessService;

    private BookingService bookingService;
    private SubscriptionService subscriptionService;
    private ProgressLogService progressLogService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository, memberRepository, classScheduleRepository, securityUtil);
        subscriptionService = new SubscriptionService(
                subscriptionRepository, memberRepository, membershipPlanRepository, securityUtil);
        progressLogService = new ProgressLogService(
                progressLogRepository, memberRepository, securityUtil, coachClientAccessService);
        authenticate("member@example.com", Role.MEMBER);
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void memberCanReadTheirOwnBookings() {
        UUID memberId = UUID.randomUUID();
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member(memberId, "member@example.com")));
        when(bookingRepository.findByMemberId(memberId)).thenReturn(List.of());

        assertEquals(List.of(), bookingService.findByMember(memberId));
    }

    @Test
    void memberCannotReadAnotherMembersBookings() {
        UUID memberId = UUID.randomUUID();
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member(memberId, "other@example.com")));

        assertThrows(AccessDeniedException.class, () -> bookingService.findByMember(memberId));
        verify(bookingRepository, never()).findByMemberId(memberId);
    }

    @Test
    void memberCannotCreateBookingForAnotherMember() {
        UUID memberId = UUID.randomUUID();
        BookingRequestDTO request = new BookingRequestDTO();
        request.setMemberId(memberId);
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member(memberId, "other@example.com")));

        assertThrows(AccessDeniedException.class, () -> bookingService.create(request));
        verify(bookingRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void memberCannotReadAnotherMembersSubscription() {
        UUID memberId = UUID.randomUUID();
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member(memberId, "other@example.com")));

        assertThrows(AccessDeniedException.class, () -> subscriptionService.findByMember(memberId));
        verify(subscriptionRepository, never()).findByMemberId(memberId);
    }

    @Test
    void memberCannotModifyAnotherMembersProgressLog() {
        UUID memberId = UUID.randomUUID();
        Progress_Log log = new Progress_Log();
        log.setMember(member(memberId, "other@example.com"));
        UUID logId = UUID.randomUUID();
        when(progressLogRepository.findById(logId)).thenReturn(Optional.of(log));

        assertThrows(AccessDeniedException.class, () -> progressLogService.delete(logId));
        verify(progressLogRepository, never()).delete(log);
    }

    @Test
    void trainerCannotModifyMemberProgress() {
        UUID memberId = UUID.randomUUID();
        Progress_Log log = new Progress_Log();
        log.setMember(member(memberId, "member@example.com"));
        UUID logId = UUID.randomUUID();
        when(progressLogRepository.findById(logId)).thenReturn(Optional.of(log));
        authenticate("trainer@example.com", Role.TRAINER);

        assertThrows(AccessDeniedException.class, () -> progressLogService.delete(logId));
        verify(progressLogRepository, never()).delete(log);
    }

    private Member member(UUID id, String email) {
        Member member = new Member();
        member.setId(id);
        member.setEmail(email);
        return member;
    }

    private void authenticate(String email, Role role) {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        email, null, List.of(new SimpleGrantedAuthority(role.authority()))));
    }
}
