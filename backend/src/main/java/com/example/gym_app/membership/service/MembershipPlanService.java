package com.example.gym_app.membership.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.membership.dto.MembershipPlanRequestDTO;
import com.example.gym_app.membership.dto.MembershipPlanResponseDTO;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Role;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MembershipPlanService {

    private final MembershipPlanRepository membershipPlanRepository;
    private final SecurityUtil securityUtil;

    public MembershipPlanService(
            MembershipPlanRepository membershipPlanRepository,
            SecurityUtil securityUtil) {
        this.membershipPlanRepository = membershipPlanRepository;
        this.securityUtil = securityUtil;
    }

    private MembershipPlanResponseDTO toDTO(Membership_Plan plan) {
        MembershipPlanResponseDTO dto = new MembershipPlanResponseDTO();
        dto.setId(plan.getId());
        dto.setNom(plan.getNom());
        dto.setNomEn(plan.getNomEn());
        dto.setNomAr(plan.getNomAr());
        dto.setPrix(plan.getPrix());
        dto.setDureeJours(plan.getDureeJours());
        dto.setActif(plan.isActif());
        return dto;
    }

    private Membership_Plan toEntity(MembershipPlanRequestDTO dto) {
        Membership_Plan plan = new Membership_Plan();
        plan.setNom(dto.getNom());
        plan.setNomEn(dto.getNomEn());
        plan.setNomAr(dto.getNomAr());
        plan.setPrix(dto.getPrix());
        plan.setDureeJours(dto.getDureeJours());
        plan.setActif(dto.getActif() == null || dto.getActif());
        return plan;
    }

    public List<MembershipPlanResponseDTO> findAll() {
        return membershipPlanRepository.findAll().stream()
                .filter(Membership_Plan::isActif)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MembershipPlanResponseDTO> findAllForManagement() {
        securityUtil.requireRole(Role.ADMIN);
        return membershipPlanRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MembershipPlanResponseDTO findById(UUID id) {
        Membership_Plan plan = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan introuvable avec id: " + id));
        if (!plan.isActif()) {
            throw new ResourceNotFoundException("Plan introuvable avec id: " + id);
        }
        return toDTO(plan);
    }
    public MembershipPlanResponseDTO update(UUID id, MembershipPlanRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        Membership_Plan existing = membershipPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan introuvable avec id: " + id));
        existing.setNom(dto.getNom());
        existing.setNomEn(dto.getNomEn());
        existing.setNomAr(dto.getNomAr());
        existing.setPrix(dto.getPrix());
        existing.setDureeJours(dto.getDureeJours());
        if (dto.getActif() != null) existing.setActif(dto.getActif());
        return toDTO(membershipPlanRepository.save(existing));
    }

    public MembershipPlanResponseDTO create(MembershipPlanRequestDTO dto) {
        securityUtil.requireRole(Role.ADMIN);
        return toDTO(membershipPlanRepository.save(toEntity(dto)));
    }

    public void delete(UUID id) {
        securityUtil.requireRole(Role.ADMIN);
        membershipPlanRepository.deleteById(id);
    }
}
