package com.example.gym_app.training.service;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.dto.TrainerBookingRequestDTO;
import com.example.gym_app.training.dto.TrainerBookingResponseDTO;
import com.example.gym_app.training.entity.Trainer_Booking;
import com.example.gym_app.training.repository.TrainerBookingRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.TrainerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TrainerBookingService {

    private final TrainerBookingRepository trainerBookingRepository;

    private final MemberRepository memberRepository;

    private final TrainerRepository trainerRepository;
    private final SecurityUtil securityUtil;

    public TrainerBookingService(
            TrainerBookingRepository trainerBookingRepository,
            MemberRepository memberRepository,
            TrainerRepository trainerRepository,
            SecurityUtil securityUtil) {
        this.trainerBookingRepository = trainerBookingRepository;
        this.memberRepository = memberRepository;
        this.trainerRepository = trainerRepository;
        this.securityUtil = securityUtil;
    }

    private TrainerBookingResponseDTO toDTO(Trainer_Booking tb) {
        TrainerBookingResponseDTO dto = new TrainerBookingResponseDTO();
        dto.setId(tb.getId());
        dto.setMemberId(tb.getMember().getId());
        dto.setMemberNom(tb.getMember().getNom());
        dto.setTrainerId(tb.getTrainer().getId());
        dto.setTrainerNom(tb.getTrainer().getNom());
        dto.setDateHeure(tb.getDateHeure());
        dto.setStatut(tb.getStatut());
        return dto;
    }

    private Trainer_Booking toEntity(TrainerBookingRequestDTO dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId()));
        Trainer trainer = trainerRepository.findById(dto.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("Trainer introuvable avec id: " + dto.getTrainerId()));

        Trainer_Booking tb = new Trainer_Booking();
        tb.setMember(member);
        tb.setTrainer(trainer);
        tb.setDateHeure(dto.getDateHeure());
        tb.setStatut(dto.getStatut());
        return tb;
    }

    public List<TrainerBookingResponseDTO> findAll() {
        if (!securityUtil.hasRole(Role.ADMIN) && !securityUtil.hasRole(Role.RECEPTIONIST)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        return trainerBookingRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TrainerBookingResponseDTO> findByMember(UUID memberId) {
        boolean staff = securityUtil.hasRole(Role.ADMIN) || securityUtil.hasRole(Role.RECEPTIONIST);
        if (!staff && !memberRepository.findById(memberId)
                .map(member -> member.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        return trainerBookingRepository.findByMemberId(memberId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TrainerBookingResponseDTO> findByTrainer(UUID trainerId) {
        boolean staff = securityUtil.hasRole(Role.ADMIN) || securityUtil.hasRole(Role.RECEPTIONIST);
        if (!staff && !trainerRepository.findById(trainerId)
                .map(trainer -> trainer.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        return trainerBookingRepository.findByTrainerId(trainerId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public TrainerBookingResponseDTO create(TrainerBookingRequestDTO dto) {
        boolean staff = securityUtil.hasRole(Role.ADMIN) || securityUtil.hasRole(Role.RECEPTIONIST);
        if (!staff && !memberRepository.findById(dto.getMemberId())
                .map(member -> member.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        Trainer_Booking tb = toEntity(dto);

        // Empeche un membre de reserver deux fois le meme trainer au meme horaire exact
        boolean dejaReserve = trainerBookingRepository.findByMemberId(tb.getMember().getId()).stream()
                .anyMatch(existing -> existing.getTrainer().getId().equals(tb.getTrainer().getId())
                        && existing.getDateHeure().equals(tb.getDateHeure())
                        && !"CANCELLED".equals(existing.getStatut()));
        if (dejaReserve) {
            throw new ConflictException("Vous avez deja reserve ce creneau avec ce trainer");
        }

        return toDTO(trainerBookingRepository.save(tb));
    }

    public TrainerBookingResponseDTO cancel(UUID id) {
        Trainer_Booking trainerBooking = trainerBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TrainerBooking introuvable avec id: " + id));

        if ("CANCELLED".equals(trainerBooking.getStatut())) {
            throw new ConflictException("Cette reservation est deja annulee");
        }

        boolean isStaffOrAdmin = securityUtil.hasRole(Role.ADMIN) || securityUtil.hasRole(Role.RECEPTIONIST);
        if (!isStaffOrAdmin) {
            String currentEmail = securityUtil.getCurrentUserEmail();
            if (!trainerBooking.getMember().getEmail().equals(currentEmail)) {
                throw new BadRequestException("Vous ne pouvez annuler que vos propres reservations");
            }
        }

        trainerBooking.setStatut("CANCELLED");
        return toDTO(trainerBookingRepository.save(trainerBooking));
    }

    public void delete(UUID id) {
        trainerBookingRepository.deleteById(id);
    }
}
