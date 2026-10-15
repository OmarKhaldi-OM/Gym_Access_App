package com.example.gym_app.membership.service;

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
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
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
        Membership_Plan plan = new Membership_Plan();
        plan.setId(planId);
        plan.setNom("Monthly");

        when(securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)).thenReturn(true);
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
    }
}
