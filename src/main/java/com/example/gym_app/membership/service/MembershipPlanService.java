package com.example.gym_app.membership.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.membership.dto.MembershipPlanRequestDTO;
import com.example.gym_app.membership.dto.MembershipPlanResponseDTO;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MembershipPlanService {

    private final MembershipPlanRepository membershipPlanRepository;

    public MembershipPlanService(
            MembershipPlanRepository membershipPlanRepository) {
        this.membershipPlanRepository = membershipPlanRepository;
    }

    private MembershipPlanResponseDTO toDTO(Membership_Plan plan) {
        MembershipPlanResponseDTO dto = new MembershipPlanResponseDTO();
        dto.setId(plan.getId());
        dto.setNom(plan.getNom());
        dto.setPrix(plan.getPrix());
        dto.setDureeJours(plan.getDureeJours());
        return dto;
    }

    private Membership_Plan toEntity(MembershipPlanRequestDTO dto) {
        Membership_Plan plan = new Membership_Plan();
        plan.setNom(dto.getNom());
        plan.setPrix(dto.getPrix());
        plan.setDureeJours(dto.getDureeJours());
        return plan;
    }

    public List<MembershipPlanResponseDTO> findAll() {
        return membershipPlanRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MembershipPlanResponseDTO findById(UUID id) {
        Membership_Plan plan = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan introuvable avec id: " + id));
        return toDTO(plan);
    }
    public MembershipPlanResponseDTO update(UUID id, MembershipPlanRequestDTO dto) {
        Membership_Plan existing = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan introuvable avec id: " + id));
        existing.setNom(dto.getNom());
        existing.setPrix(dto.getPrix());
        existing.setDureeJours(dto.getDureeJours());
        return toDTO(membershipPlanRepository.save(existing));
    }

    public MembershipPlanResponseDTO create(MembershipPlanRequestDTO dto) {
        return toDTO(membershipPlanRepository.save(toEntity(dto)));
    }

    public void delete(UUID id) {
        membershipPlanRepository.deleteById(id);
    }
}
