package com.example.gym_app.membership.service;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.membership.dto.SubscriptionEnrollmentRequestDTO;
import com.example.gym_app.membership.dto.SubscriptionRequestDTO;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.entity.Subscription;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.membership.repository.SubscriptionRepository;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private MembershipPlanRepository membershipPlanRepository;
    @Mock
    private SecurityUtil securityUtil;

    private SubscriptionService subscriptionService;

    @BeforeEach
    void setUp() {
        subscriptionService = new SubscriptionService(
                subscriptionRepository, memberRepository, membershipPlanRepository, securityUtil);
    }

    @Test
    void createsSubscriptionForSelectedMemberAndPlan() {
        UUID memberId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Member member = new Member();
        member.setId(memberId);
        member.setNom("Member");
        member.setEmail("member@example.com");
        Membership_Plan plan = new Membership_Plan();
        plan.setId(planId);
        plan.setNom("Monthly");
        plan.setActif(true);

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SubscriptionRequestDTO request = new SubscriptionRequestDTO();
        request.setMemberId(memberId);
        request.setPlanId(planId);
        request.setDateDebut(LocalDate.now());
        request.setDateFin(LocalDate.now().plusMonths(1));
        request.setStatut("ACTIVE");

        var response = subscriptionService.create(request);

        ArgumentCaptor<Subscription> savedSubscription = ArgumentCaptor.forClass(Subscription.class);
        verify(subscriptionRepository).save(savedSubscription.capture());
        assertEquals(member, savedSubscription.getValue().getMember());
        assertEquals(plan, savedSubscription.getValue().getMembership_plan());
        assertEquals(request.getDateDebut(), response.getDateDebut());
        assertEquals(request.getDateFin(), response.getDateFin());
        assertEquals("ACTIVE", response.getStatut());
        verify(securityUtil).requireStaff();
    }

    @Test
    void enrollmentUsesAuthenticatedMemberAndServerGeneratedMembershipDetails() {
        UUID memberId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Member member = member(memberId);
        Membership_Plan plan = plan(planId, 30);
        LocalDate today = LocalDate.now();
        when(securityUtil.getCurrentUserEmail()).thenReturn(member.getEmail());
        when(memberRepository.lockAccountByEmail(member.getEmail())).thenReturn(Optional.of(member.getEmail()));
        when(memberRepository.findByEmail(member.getEmail())).thenReturn(Optional.of(member));
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(subscriptionRepository.findByMemberId(memberId)).thenReturn(List.of());
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SubscriptionEnrollmentRequestDTO request = new SubscriptionEnrollmentRequestDTO();
        request.setPlanId(planId);
        var response = subscriptionService.enrollCurrentMember(request);

        ArgumentCaptor<Subscription> saved = ArgumentCaptor.forClass(Subscription.class);
        verify(subscriptionRepository).save(saved.capture());
        assertSame(member, saved.getValue().getMember());
        assertSame(plan, saved.getValue().getMembership_plan());
        assertEquals(today, saved.getValue().getDateDebut());
        assertEquals(today.plusDays(30), saved.getValue().getDateFin());
        assertEquals("ACTIVE", saved.getValue().getStatut());
        assertEquals("ACTIVE", response.getStatut());
        verify(securityUtil).requireRole(Role.MEMBER);
        verify(memberRepository).lockAccountByEmail(member.getEmail());
    }

    @Test
    void duplicateEnrollmentForSameActivePlanReturnsExistingSubscription() {
        UUID memberId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Member member = member(memberId);
        Membership_Plan plan = plan(planId, 30);
        Subscription existing = activeSubscription(member, plan);
        when(securityUtil.getCurrentUserEmail()).thenReturn(member.getEmail());
        when(memberRepository.lockAccountByEmail(member.getEmail())).thenReturn(Optional.of(member.getEmail()));
        when(memberRepository.findByEmail(member.getEmail())).thenReturn(Optional.of(member));
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(subscriptionRepository.findByMemberId(memberId)).thenReturn(List.of(existing));

        SubscriptionEnrollmentRequestDTO request = enrollmentRequest(planId);
        var response = subscriptionService.enrollCurrentMember(request);

        assertEquals(existing.getId(), response.getId());
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    @Test
    void enrollmentRejectsAnUnavailablePlanBeforeSaving() {
        UUID memberId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Member member = member(memberId);
        Membership_Plan plan = plan(planId, 30);
        plan.setActif(false);
        when(securityUtil.getCurrentUserEmail()).thenReturn(member.getEmail());
        when(memberRepository.lockAccountByEmail(member.getEmail())).thenReturn(Optional.of(member.getEmail()));
        when(memberRepository.findByEmail(member.getEmail())).thenReturn(Optional.of(member));
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.of(plan));

        assertThrows(ConflictException.class,
                () -> subscriptionService.enrollCurrentMember(enrollmentRequest(planId)));
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    @Test
    void enrollmentRejectsAnUnknownPlan() {
        UUID memberId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Member member = member(memberId);
        when(securityUtil.getCurrentUserEmail()).thenReturn(member.getEmail());
        when(memberRepository.lockAccountByEmail(member.getEmail())).thenReturn(Optional.of(member.getEmail()));
        when(memberRepository.findByEmail(member.getEmail())).thenReturn(Optional.of(member));
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> subscriptionService.enrollCurrentMember(enrollmentRequest(planId)));
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    @Test
    void enrollmentRejectsASecondDifferentActivePlan() {
        UUID memberId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Member member = member(memberId);
        Membership_Plan selectedPlan = plan(planId, 30);
        Membership_Plan existingPlan = plan(UUID.randomUUID(), 365);
        Subscription existing = activeSubscription(member, existingPlan);
        when(securityUtil.getCurrentUserEmail()).thenReturn(member.getEmail());
        when(memberRepository.lockAccountByEmail(member.getEmail())).thenReturn(Optional.of(member.getEmail()));
        when(memberRepository.findByEmail(member.getEmail())).thenReturn(Optional.of(member));
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.of(selectedPlan));
        when(subscriptionRepository.findByMemberId(memberId)).thenReturn(List.of(existing));

        assertThrows(ConflictException.class,
                () -> subscriptionService.enrollCurrentMember(enrollmentRequest(planId)));
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    @Test
    void enrollmentRejectsMalformedPlanDetails() {
        UUID memberId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();
        Member member = member(memberId);
        Membership_Plan plan = plan(planId, 0);
        when(securityUtil.getCurrentUserEmail()).thenReturn(member.getEmail());
        when(memberRepository.lockAccountByEmail(member.getEmail())).thenReturn(Optional.of(member.getEmail()));
        when(memberRepository.findByEmail(member.getEmail())).thenReturn(Optional.of(member));
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.of(plan));

        assertThrows(BadRequestException.class,
                () -> subscriptionService.enrollCurrentMember(enrollmentRequest(planId)));
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    private Member member(UUID id) {
        Member member = new Member();
        member.setId(id);
        member.setNom("Member");
        member.setEmail("member@example.com");
        return member;
    }

    private Membership_Plan plan(UUID id, int durationDays) {
        Membership_Plan plan = new Membership_Plan();
        plan.setId(id);
        plan.setNom("Plan");
        plan.setPrix(new java.math.BigDecimal("80.00"));
        plan.setDureeJours(durationDays);
        plan.setActif(true);
        return plan;
    }

    private Subscription activeSubscription(Member member, Membership_Plan plan) {
        Subscription subscription = new Subscription();
        subscription.setId(UUID.randomUUID());
        subscription.setMember(member);
        subscription.setMembership_plan(plan);
        subscription.setDateDebut(LocalDate.now());
        subscription.setDateFin(LocalDate.now().plusDays(10));
        subscription.setStatut("ACTIVE");
        return subscription;
    }

    private SubscriptionEnrollmentRequestDTO enrollmentRequest(UUID planId) {
        SubscriptionEnrollmentRequestDTO request = new SubscriptionEnrollmentRequestDTO();
        request.setPlanId(planId);
        return request;
    }
}
