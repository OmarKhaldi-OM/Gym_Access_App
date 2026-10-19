package com.example.gym_app.training.service;

import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.repository.CoachingRequestRepository;
import com.example.gym_app.training.repository.TrainerBookingRepository;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.TrainerRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CoachClientAccessService {
    private final SecurityUtil securityUtil;
    private final TrainerRepository trainerRepository;
    private final TrainerBookingRepository trainerBookingRepository;
    private final CoachingRequestRepository coachingRequestRepository;

    public CoachClientAccessService(
            SecurityUtil securityUtil,
            TrainerRepository trainerRepository,
            TrainerBookingRepository trainerBookingRepository,
            CoachingRequestRepository coachingRequestRepository) {
        this.securityUtil = securityUtil;
        this.trainerRepository = trainerRepository;
        this.trainerBookingRepository = trainerBookingRepository;
        this.coachingRequestRepository = coachingRequestRepository;
    }

    public Trainer requireCurrentCoach() {
        securityUtil.requireRole(Role.TRAINER);
        return trainerRepository.findByEmail(securityUtil.getCurrentUserEmail())
                .orElseThrow(() -> new AccessDeniedException("Acces refuse"));
    }

    public Trainer requireClientAccess(UUID memberId) {
        Trainer trainer = requireCurrentCoach();
        boolean hasSession = trainerBookingRepository
                .findByTrainerIdAndMemberId(trainer.getId(), memberId).stream()
                .anyMatch(booking -> !"CANCELLED".equalsIgnoreCase(booking.getStatut()));
        boolean hasAcceptedRequest = coachingRequestRepository
                .findByTrainerIdAndMemberId(trainer.getId(), memberId).stream()
                .anyMatch(request -> "ACCEPTED".equalsIgnoreCase(request.getStatus()));
        if (!hasSession && !hasAcceptedRequest) {
            throw new AccessDeniedException("Acces refuse");
        }
        return trainer;
    }
}
