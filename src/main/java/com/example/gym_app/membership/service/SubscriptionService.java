package com.example.gym_app.membership.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.membership.dto.SubscriptionRequestDTO;
import com.example.gym_app.membership.dto.SubscriptionResponseDTO;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.entity.Subscription;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.membership.repository.SubscriptionRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private MembershipPlanRepository membershipPlanRepository;

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
        return subscriptionRepository.findByMemberId(memberId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public boolean hasActiveSubscription(UUID memberId) {
        return subscriptionRepository.findByMemberId(memberId).stream()
                .anyMatch(s -> "ACTIVE".equals(s.getStatut()) && !s.getDateFin().isBefore(LocalDate.now()));
    }

    public SubscriptionResponseDTO create(SubscriptionRequestDTO dto) {
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
