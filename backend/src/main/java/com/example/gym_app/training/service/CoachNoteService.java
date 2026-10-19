package com.example.gym_app.training.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.dto.CoachNoteRequestDTO;
import com.example.gym_app.training.dto.CoachNoteResponseDTO;
import com.example.gym_app.training.entity.CoachNote;
import com.example.gym_app.training.repository.CoachNoteRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CoachNoteService {
    private final CoachNoteRepository coachNoteRepository;
    private final MemberRepository memberRepository;
    private final CoachClientAccessService coachClientAccessService;
    private final SecurityUtil securityUtil;

    public CoachNoteService(
            CoachNoteRepository coachNoteRepository,
            MemberRepository memberRepository,
            CoachClientAccessService coachClientAccessService,
            SecurityUtil securityUtil) {
        this.coachNoteRepository = coachNoteRepository;
        this.memberRepository = memberRepository;
        this.coachClientAccessService = coachClientAccessService;
        this.securityUtil = securityUtil;
    }

    public List<CoachNoteResponseDTO> findByMember(UUID memberId) {
        Trainer coach = coachClientAccessService.requireClientAccess(memberId);
        return coachNoteRepository.findByCoachIdAndMemberIdOrderByCreatedAtDesc(coach.getId(), memberId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public CoachNoteResponseDTO create(UUID memberId, CoachNoteRequestDTO request) {
        Trainer coach = coachClientAccessService.requireClientAccess(memberId);
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + memberId));
        CoachNote note = new CoachNote();
        note.setCoach(coach);
        note.setMember(member);
        note.setContenu(request.getContenu().trim());
        return toDTO(coachNoteRepository.save(note));
    }

    @Transactional
    public CoachNoteResponseDTO update(UUID id, CoachNoteRequestDTO request) {
        CoachNote note = findOwnedNote(id);
        note.setContenu(request.getContenu().trim());
        return toDTO(coachNoteRepository.save(note));
    }

    @Transactional
    public void delete(UUID id) {
        coachNoteRepository.delete(findOwnedNote(id));
    }

    private CoachNote findOwnedNote(UUID id) {
        CoachNote note = coachNoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note introuvable avec id: " + id));
        Trainer coach = coachClientAccessService.requireCurrentCoach();
        if (!coach.getId().equals(note.getCoach().getId())
                || !securityUtil.isCurrentUser(note.getCoach().getEmail())) {
            throw new AccessDeniedException("Acces refuse");
        }
        return note;
    }

    private CoachNoteResponseDTO toDTO(CoachNote note) {
        CoachNoteResponseDTO dto = new CoachNoteResponseDTO();
        dto.setId(note.getId());
        dto.setCoachId(note.getCoach().getId());
        dto.setMemberId(note.getMember().getId());
        dto.setContenu(note.getContenu());
        dto.setCreatedAt(note.getCreatedAt());
        return dto;
    }
}
