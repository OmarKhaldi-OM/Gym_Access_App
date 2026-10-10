package com.example.gym_app.training.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.training.dto.ProgressLogRequestDTO;
import com.example.gym_app.training.dto.ProgressLogResponseDTO;
import com.example.gym_app.training.entity.Progress_Log;
import com.example.gym_app.training.repository.ProgressLogRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProgressLogService {

    private final ProgressLogRepository progressLogRepository;

    private final MemberRepository memberRepository;
    private final SecurityUtil securityUtil;

    public ProgressLogService(
            ProgressLogRepository progressLogRepository,
            MemberRepository memberRepository,
            SecurityUtil securityUtil) {
        this.progressLogRepository = progressLogRepository;
        this.memberRepository = memberRepository;
        this.securityUtil = securityUtil;
    }

    private void requireMemberAccess(UUID memberId) {
        if (!securityUtil.hasRole(Role.ADMIN) && !memberRepository.findById(memberId)
                .map(member -> member.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new AccessDeniedException("Acces refuse");
        }
    }

    private ProgressLogResponseDTO toDTO(Progress_Log pl) {
        ProgressLogResponseDTO dto = new ProgressLogResponseDTO();
        dto.setId(pl.getId());
        dto.setMemberId(pl.getMember().getId());
        dto.setDateMesure(pl.getDateMesure());
        dto.setPoids(pl.getPoids());
        dto.setMasseGrasse(pl.getMasseGrasse());
        dto.setNotes(pl.getNotes());
        return dto;
    }

    private Progress_Log toEntity(ProgressLogRequestDTO dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId()));

        Progress_Log pl = new Progress_Log();
        pl.setMember(member);
        pl.setDateMesure(dto.getDateMesure());
        pl.setPoids(dto.getPoids());
        pl.setMasseGrasse(dto.getMasseGrasse());
        pl.setNotes(dto.getNotes());
        return pl;
    }

    public List<ProgressLogResponseDTO> findByMember(UUID memberId) {
        requireMemberAccess(memberId);
        return progressLogRepository.findByMemberIdOrderByDateMesureAsc(memberId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ProgressLogResponseDTO create(ProgressLogRequestDTO dto) {
        requireMemberAccess(dto.getMemberId());
        return toDTO(progressLogRepository.save(toEntity(dto)));
    }

    public ProgressLogResponseDTO update(UUID id, ProgressLogRequestDTO dto) {
        Progress_Log existing = progressLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgressLog introuvable avec id: " + id));
        requireMemberAccess(existing.getMember().getId());
        existing.setDateMesure(dto.getDateMesure());
        existing.setPoids(dto.getPoids());
        existing.setMasseGrasse(dto.getMasseGrasse());
        existing.setNotes(dto.getNotes());
        return toDTO(progressLogRepository.save(existing));
    }

    public void delete(UUID id) {
        Progress_Log existing = progressLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("ProgressLog introuvable avec id: " + id));
        requireMemberAccess(existing.getMember().getId());
        progressLogRepository.delete(existing);
    }
}
