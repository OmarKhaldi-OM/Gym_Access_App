package com.example.gym_app.membership.service;

import com.example.gym_app.membership.dto.MembershipPlanRequestDTO;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.security.SecurityUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MembershipPlanServiceTest {

    @Mock
    private MembershipPlanRepository membershipPlanRepository;
    @Mock
    private SecurityUtil securityUtil;

    private MembershipPlanService service;

    @BeforeEach
    void setUp() {
        service = new MembershipPlanService(membershipPlanRepository, securityUtil);
    }

    @Test
    void publicPlanListContainsOnlyAvailablePlans() {
        Membership_Plan available = plan(true);
        Membership_Plan unavailable = plan(false);
        when(membershipPlanRepository.findAll()).thenReturn(List.of(available, unavailable));

        var result = service.findAll();

        assertEquals(1, result.size());
        assertEquals(available.getId(), result.get(0).getId());
        assertEquals(true, result.get(0).isActif());
    }

    @Test
    void managementListIncludesUnavailablePlansAndRequiresStaff() {
        when(membershipPlanRepository.findAll()).thenReturn(List.of(plan(true), plan(false)));

        var result = service.findAllForManagement();

        assertEquals(2, result.size());
        verify(securityUtil).requireStaff();
    }

    @Test
    void staffCanDeactivateAPlan() {
        UUID planId = UUID.randomUUID();
        Membership_Plan plan = plan(true);
        plan.setId(planId);
        MembershipPlanRequestDTO update = new MembershipPlanRequestDTO();
        update.setNom(plan.getNom());
        update.setPrix(plan.getPrix());
        update.setDureeJours(plan.getDureeJours());
        update.setActif(false);
        when(membershipPlanRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(membershipPlanRepository.save(plan)).thenReturn(plan);

        var response = service.update(planId, update);

        assertFalse(response.isActif());
        verify(securityUtil).requireStaff();
    }

    private Membership_Plan plan(boolean active) {
        Membership_Plan plan = new Membership_Plan();
        plan.setId(UUID.randomUUID());
        plan.setNom("Configured plan");
        plan.setPrix(new BigDecimal("80.00"));
        plan.setDureeJours(30);
        plan.setActif(active);
        return plan;
    }
}
