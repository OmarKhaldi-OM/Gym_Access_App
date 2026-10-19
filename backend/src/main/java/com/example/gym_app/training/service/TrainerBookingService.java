package com.example.gym_app.training.service;

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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
        dto.setMemberNom(tb.getMember().getPrenom() + " " + tb.getMember().getNom());
        dto.setMemberArchived(tb.getMember().isArchived());
        dto.setTrainerId(tb.getTrainer().getId());
        dto.setTrainerNom(tb.getTrainer().getPrenom() + " " + tb.getTrainer().getNom());
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

    @Transactional(readOnly = true)
    public List<TrainerBookingResponseDTO> findAll() {
        securityUtil.requireStaff();
        LocalDateTime now = LocalDateTime.now();
        return trainerBookingRepository.findAll().stream()
                .filter(booking -> isVisibleHistory(booking, now))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainerBookingResponseDTO> findByMember(UUID memberId) {
        if (securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)) {
            return mapVisibleHistory(trainerBookingRepository.findByMemberId(memberId));
        }
        securityUtil.requireRole(Role.MEMBER);
        if (!memberRepository.findById(memberId)
                .map(member -> securityUtil.isCurrentUser(member.getEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        return mapVisibleHistory(trainerBookingRepository.findByMemberId(memberId));
    }

    @Transactional(readOnly = true)
    public List<TrainerBookingResponseDTO> findByTrainer(UUID trainerId) {
        if (securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)) {
            return mapVisibleHistory(trainerBookingRepository.findByTrainerId(trainerId));
        }
        securityUtil.requireRole(Role.TRAINER);
        if (!trainerRepository.findById(trainerId)
                .map(trainer -> securityUtil.isCurrentUser(trainer.getEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        return mapVisibleHistory(trainerBookingRepository.findByTrainerId(trainerId));
    }

    @Transactional(readOnly = true)
    public List<TrainerBookingResponseDTO> findClientsByTrainer(UUID trainerId) {
        return findByTrainer(trainerId).stream()
                .filter(booking -> !booking.isMemberArchived())
                .filter(booking -> !"CANCELLED".equalsIgnoreCase(booking.getStatut()))
                .toList();
    }

    private List<TrainerBookingResponseDTO> mapVisibleHistory(List<Trainer_Booking> bookings) {
        LocalDateTime now = LocalDateTime.now();
        return bookings.stream()
                .filter(booking -> isVisibleHistory(booking, now))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private boolean isVisibleHistory(Trainer_Booking booking, LocalDateTime now) {
        return !booking.getMember().isArchived() || !booking.getDateHeure().isAfter(now);
    }

    public TrainerBookingResponseDTO create(TrainerBookingRequestDTO dto) {
        if (!securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)) {
            securityUtil.requireRole(Role.MEMBER);
        }
        if (!securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)
                && !memberRepository.findById(dto.getMemberId())
                .map(member -> securityUtil.isCurrentUser(member.getEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
        Trainer_Booking tb = toEntity(dto);
        if (tb.getMember().isArchived()) {
            throw new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId());
        }

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

        if (securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)) {
            trainerBooking.setStatut("CANCELLED");
            return toDTO(trainerBookingRepository.save(trainerBooking));
        }
        securityUtil.requireRole(Role.MEMBER);
        if (!securityUtil.isCurrentUser(trainerBooking.getMember().getEmail())) {
            throw new org.springframework.security.access.AccessDeniedException("Vous ne pouvez annuler que vos propres reservations");
        }

        trainerBooking.setStatut("CANCELLED");
        return toDTO(trainerBookingRepository.save(trainerBooking));
    }

    public void delete(UUID id) {
        securityUtil.requireStaff();
        trainerBookingRepository.deleteById(id);
    }
}
