package com.example.gym_app.training.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.dto.MemberGoalDTO;
import com.example.gym_app.training.entity.MemberGoal;
import com.example.gym_app.training.repository.MemberGoalRepository;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MemberGoalService {
    private final MemberGoalRepository goalRepository;
    private final MemberRepository memberRepository;
    private final SecurityUtil securityUtil;

    public MemberGoalService(MemberGoalRepository goalRepository, MemberRepository memberRepository, SecurityUtil securityUtil) {
        this.goalRepository = goalRepository;
        this.memberRepository = memberRepository;
        this.securityUtil = securityUtil;
    }

    private void requireOwner(UUID memberId) {
        securityUtil.requireRole(Role.MEMBER);
        if (!memberRepository.findById(memberId)
                .map(member -> securityUtil.isCurrentUser(member.getEmail())).orElse(false)) {
            throw new AccessDeniedException("Acces refuse");
        }
    }

    private MemberGoalDTO toDTO(MemberGoal goal) {
        MemberGoalDTO dto = new MemberGoalDTO();
        dto.setId(goal.getId());
        dto.setMemberId(goal.getMember().getId());
        dto.setName(goal.getName());
        dto.setTarget(goal.getTarget());
        dto.setCurrent(goal.getCurrent());
        dto.setDeadline(goal.getDeadline());
        dto.setStatus(goal.getStatus().toLowerCase());
        return dto;
    }

    public List<MemberGoalDTO> findByMember(UUID memberId) {
        requireOwner(memberId);
        return goalRepository.findByMemberIdOrderByDeadlineAsc(memberId).stream().map(this::toDTO).toList();
    }

    public MemberGoalDTO create(UUID memberId, MemberGoalDTO dto) {
        requireOwner(memberId);
        MemberGoal goal = new MemberGoal();
        goal.setMember(memberRepository.findById(memberId).orElseThrow(() -> new ResourceNotFoundException("Member introuvable")));
        apply(goal, dto);
        return toDTO(goalRepository.save(goal));
    }

    @Transactional
    public MemberGoalDTO update(UUID id, MemberGoalDTO dto) {
        MemberGoal goal = goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        requireOwner(goal.getMember().getId());
        apply(goal, dto);
        return toDTO(goalRepository.save(goal));
    }

    public void delete(UUID id) {
        MemberGoal goal = goalRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Objectif introuvable"));
        requireOwner(goal.getMember().getId());
        goalRepository.delete(goal);
    }

    private void apply(MemberGoal goal, MemberGoalDTO dto) {
        goal.setName(dto.getName());
        goal.setTarget(dto.getTarget());
        goal.setCurrent(dto.getCurrent() == null ? 0 : dto.getCurrent());
        goal.setDeadline(dto.getDeadline());
        goal.setStatus(dto.getStatus() == null ? "ACTIVE" : dto.getStatus().toUpperCase());
    }
}