package com.example.gym_app.training.service;

import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.dto.CoachingRequestCreateDTO;
import com.example.gym_app.training.dto.CoachingRequestResponseDTO;
import com.example.gym_app.training.dto.CoachingRequestStatusDTO;
import com.example.gym_app.training.entity.CoachingRequest;
import com.example.gym_app.training.entity.Trainer_Booking;
import com.example.gym_app.training.repository.CoachingRequestRepository;
import com.example.gym_app.training.repository.TrainerBookingRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.TrainerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CoachingRequestService {
    private final CoachingRequestRepository requestRepository;
    private final TrainerBookingRepository trainerBookingRepository;
    private final MemberRepository memberRepository;
    private final TrainerRepository trainerRepository;
    private final SecurityUtil securityUtil;

    public CoachingRequestService(CoachingRequestRepository requestRepository, TrainerBookingRepository trainerBookingRepository,
                                  MemberRepository memberRepository, TrainerRepository trainerRepository, SecurityUtil securityUtil) {
        this.requestRepository = requestRepository;
        this.trainerBookingRepository = trainerBookingRepository;
        this.memberRepository = memberRepository;
        this.trainerRepository = trainerRepository;
        this.securityUtil = securityUtil;
    }

    private CoachingRequestResponseDTO toDTO(CoachingRequest request) {
        CoachingRequestResponseDTO dto = new CoachingRequestResponseDTO();
        dto.setId(request.getId());
        dto.setMemberId(request.getMember().getId());
        dto.setMemberName(request.getMember().getPrenom() + " " + request.getMember().getNom());
        dto.setTrainerId(request.getTrainer().getId());
        dto.setTrainerName(request.getTrainer().getPrenom() + " " + request.getTrainer().getNom());
        dto.setRequestedAt(request.getRequestedAt());
        dto.setGoal(request.getGoal());
        dto.setStatus(request.getStatus());
        dto.setResponse(request.getResponse());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        return dto;
    }

    private void requireMember(UUID memberId) {
        if (!securityUtil.hasRole(Role.ADMIN) && !securityUtil.hasRole(Role.RECEPTIONIST)
                && !memberRepository.findById(memberId).map(member -> member.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
    }

    public List<CoachingRequestResponseDTO> findByMember(UUID memberId) {
        requireMember(memberId);
        return requestRepository.findByMemberIdOrderByCreatedAtDesc(memberId).stream().map(this::toDTO).toList();
    }

    public List<CoachingRequestResponseDTO> findByTrainer(UUID trainerId) {
        if (!securityUtil.hasRole(Role.ADMIN) && !securityUtil.hasRole(Role.RECEPTIONIST)
                && !trainerRepository.findById(trainerId).map(trainer -> trainer.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        return requestRepository.findByTrainerIdOrderByCreatedAtDesc(trainerId).stream().map(this::toDTO).toList();
    }

    public CoachingRequestResponseDTO create(CoachingRequestCreateDTO dto) {
        requireMember(dto.getMemberId());
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable"));
        Trainer trainer = trainerRepository.findById(dto.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainer introuvable"));
        CoachingRequest request = new CoachingRequest();
        request.setMember(member);
        request.setTrainer(trainer);
        request.setRequestedAt(dto.getRequestedAt());
        request.setGoal(dto.getGoal());
        request.setCreatedAt(LocalDateTime.now());
        return toDTO(requestRepository.save(request));
    }

    @Transactional
    public CoachingRequestResponseDTO updateStatus(UUID id, CoachingRequestStatusDTO dto) {
        CoachingRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande introuvable"));
        String status = dto.getStatus().trim().toUpperCase();
        boolean staff = securityUtil.hasRole(Role.ADMIN) || securityUtil.hasRole(Role.RECEPTIONIST);
        boolean member = request.getMember().getEmail().equals(securityUtil.getCurrentUserEmail());
        boolean trainer = request.getTrainer().getEmail().equals(securityUtil.getCurrentUserEmail());
        if ("CANCELLED".equals(status)) {
            if (!staff && !member) throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        } else if (!staff && !trainer) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        if (!"PENDING".equals(request.getStatus())) throw new ConflictException("Cette demande a deja ete traitee");
        if (!List.of("ACCEPTED", "REJECTED", "CANCELLED").contains(status)) {
            throw new ConflictException("Statut de demande invalide");
        }
        if ("ACCEPTED".equals(status)) {
            Trainer_Booking booking = trainerBookingRepository.findByTrainerId(request.getTrainer().getId()).stream()
                .filter(existing -> existing.getMember().getId().equals(request.getMember().getId())
                    && existing.getDateHeure().equals(request.getRequestedAt()))
                .findFirst()
                .orElseGet(Trainer_Booking::new);
            booking.setMember(request.getMember());
            booking.setTrainer(request.getTrainer());
            booking.setDateHeure(request.getRequestedAt());
            booking.setStatut("CONFIRMED");
            trainerBookingRepository.save(booking);
        }
        request.setStatus(status);
        request.setResponse(dto.getResponse());
        request.setUpdatedAt(LocalDateTime.now());
        return toDTO(requestRepository.save(request));
    }
}