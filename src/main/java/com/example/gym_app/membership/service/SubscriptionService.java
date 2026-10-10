package com.example.gym_app.membership.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.membership.dto.SubscriptionRequestDTO;
import com.example.gym_app.membership.dto.SubscriptionResponseDTO;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.entity.Subscription;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.membership.repository.SubscriptionRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    private final MemberRepository memberRepository;

    private final MembershipPlanRepository membershipPlanRepository;
    private final SecurityUtil securityUtil;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            MemberRepository memberRepository,
            MembershipPlanRepository membershipPlanRepository,
            SecurityUtil securityUtil) {
        this.subscriptionRepository = subscriptionRepository;
        this.memberRepository = memberRepository;
        this.membershipPlanRepository = membershipPlanRepository;
        this.securityUtil = securityUtil;
    }

    private SubscriptionResponseDTO toDTO(Subscription subscription) {
        SubscriptionResponseDTO dto = new SubscriptionResponseDTO();
        dto.setId(subscription.getId());
        dto.setMemberId(subscription.getMember().getId());
        dto.setMemberNom(subscription.getMember().getNom());
        dto.setPlanId(subscription.getMembership_plan().getId());
        dto.setPlanNom(subscription.getMembership_plan().getNom());
        dto.setDateDebut(subscription.getDateDebut());
        dto.setDateFin(subscription.getDateFin());
        dto.setStatut(subscription.getStatut());
        return dto;
    }

    private Subscription toEntity(SubscriptionRequestDTO dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId()));
        Membership_Plan plan = membershipPlanRepository.findById(dto.getPlanId())
                .orElseThrow(() -> new  ResourceNotFoundException("Plan introuvable avec id: " + dto.getPlanId()));

        Subscription subscription = new Subscription();
        subscription.setMember(member);
        subscription.setMembership_plan(plan);
        subscription.setDateDebut(dto.getDateDebut());
        subscription.setDateFin(dto.getDateFin());
        subscription.setStatut(dto.getStatut());
        return subscription;
    }

    public List<SubscriptionResponseDTO> findAll() {
        return subscriptionRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public SubscriptionResponseDTO findById(UUID id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription introuvable avec id: " + id));
        return toDTO(subscription);
    }

    public List<SubscriptionResponseDTO> findByMember(UUID memberId) {
        requireMemberAccess(memberId);
        return subscriptionRepository.findByMemberId(memberId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    private void requireMemberAccess(UUID memberId) {
        boolean staff = securityUtil.hasRole(Role.ADMIN) || securityUtil.hasRole(Role.RECEPTIONIST);
        if (!staff && !memberRepository.findById(memberId)
                .map(member -> member.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new AccessDeniedException("Acces refuse");
        }
    }

    public boolean hasActiveSubscription(UUID memberId) {
        return subscriptionRepository.findByMemberId(memberId).stream()
                .anyMatch(s -> "ACTIVE".equals(s.getStatut()) && !s.getDateFin().isBefore(LocalDate.now()));
    }

    public SubscriptionResponseDTO create(SubscriptionRequestDTO dto) {
        requireMemberAccess(dto.getMemberId());
        return toDTO(subscriptionRepository.save(toEntity(dto)));
    }

    public SubscriptionResponseDTO update(UUID id, SubscriptionRequestDTO dto) {
        Subscription existing = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription introuvable avec id: " + id));
        // memberId et planId ne sont volontairement pas modifiables ici :
        // changer d'abonne ou de plan sur une subscription existante fausserait l'historique
        existing.setDateFin(dto.getDateFin());
        existing.setStatut(dto.getStatut());
        return toDTO(subscriptionRepository.save(existing));
    }

    public void delete(UUID id) {
        subscriptionRepository.deleteById(id);
    }
}
