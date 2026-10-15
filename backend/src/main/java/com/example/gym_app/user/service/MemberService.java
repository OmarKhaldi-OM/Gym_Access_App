package com.example.gym_app.user.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.access.repository.FaceAuthenticationRepository;
import com.example.gym_app.access.repository.FaceEmbeddingRepository;
import com.example.gym_app.membership.entity.Subscription;
import com.example.gym_app.membership.repository.SubscriptionRepository;
import com.example.gym_app.security.ProfilePhotoStorageService;
import com.example.gym_app.user.dto.MemberRequestDTO;
import com.example.gym_app.user.dto.MemberResponseDTO;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;
    private final SubscriptionRepository subscriptionRepository;
    private final FaceEmbeddingRepository faceEmbeddingRepository;
    private final FaceAuthenticationRepository faceAuthenticationRepository;
    private final ProfilePhotoStorageService profilePhotoStorageService;

    // ---- Mapping entite -> DTO ----

    public MemberService(
            MemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            SecurityUtil securityUtil,
            SubscriptionRepository subscriptionRepository,
            FaceEmbeddingRepository faceEmbeddingRepository,
            FaceAuthenticationRepository faceAuthenticationRepository,
            ProfilePhotoStorageService profilePhotoStorageService) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtil = securityUtil;
        this.subscriptionRepository = subscriptionRepository;
        this.faceEmbeddingRepository = faceEmbeddingRepository;
        this.faceAuthenticationRepository = faceAuthenticationRepository;
        this.profilePhotoStorageService = profilePhotoStorageService;
    }

    private MemberResponseDTO toDTO(Member member) {
        MemberResponseDTO dto = new MemberResponseDTO();
        dto.setId(member.getId());
        dto.setNom(member.getNom());
        dto.setPrenom(member.getPrenom());
        dto.setEmail(member.getEmail());
        dto.setDateNaissance(member.getDateNaissance());
        dto.setDateInscription(member.getDateInscription());
        dto.setVisageEnrole(member.getFaceEmbeddings() != null && !member.getFaceEmbeddings().isEmpty());
        return dto;
    }

    // ---- Mapping DTO -> entite ----
    private Member toEntity(MemberRequestDTO dto) {
        Member member = new Member();
        member.setNom(dto.getNom());
        member.setPrenom(dto.getPrenom());
        member.setEmail(dto.getEmail());
        member.setMotDePasse(passwordEncoder.encode(dto.getMotDePasse()));
        member.setRole(Role.MEMBER);
        member.setDateNaissance(dto.getDateNaissance());
        member.setDateInscription(LocalDateTime.now());
        return member;
    }

    public List<MemberResponseDTO> findAll() {
        securityUtil.requireStaff();
        return memberRepository.findByArchivedFalse().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MemberResponseDTO findById(UUID id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + id));
        if (member.isArchived()) {
            throw new ResourceNotFoundException("Member introuvable avec id: " + id);
        }
        if (!securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)) {
            securityUtil.requireRole(Role.MEMBER);
        }
        if (!securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)
                && !securityUtil.isCurrentUser(member.getEmail())) {
            throw new AccessDeniedException("Acces refuse");
        }
        return toDTO(member);
    }

    public MemberResponseDTO create(MemberRequestDTO dto) {
        securityUtil.requireStaff();
        Member saved = memberRepository.save(toEntity(dto));
        return toDTO(saved);
    }

    public MemberResponseDTO update(UUID id, MemberRequestDTO dto) {
        securityUtil.requireStaff();
        Member existing = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + id));
        if (existing.isArchived()) {
            throw new ResourceNotFoundException("Member introuvable avec id: " + id);
        }
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(dto.getEmail());
        existing.setDateNaissance(dto.getDateNaissance());
        return toDTO(memberRepository.save(existing));
    }

    @Transactional
    public void delete(UUID id) {
        securityUtil.requireStaff();
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + id));
        if (member.isArchived()) return;

        List<Subscription> subscriptions = subscriptionRepository.findByMemberId(id);
        for (Subscription subscription : subscriptions) {
            if ("ACTIVE".equalsIgnoreCase(subscription.getStatut())) {
                subscription.setStatut("CANCELLED");
            }
        }
        subscriptionRepository.saveAll(subscriptions);

        faceEmbeddingRepository.deleteAllByMemberId(id);
        faceAuthenticationRepository.findByUserId(id).ifPresent(faceAuthenticationRepository::delete);
        profilePhotoStorageService.delete(member.getProfilePhotoFilename());

        member.setArchived(true);
        member.setNom("Membre anonymisé");
        member.setPrenom("");
        member.setEmail("deleted+" + id + "@invalid.local");
        member.setMotDePasse(passwordEncoder.encode(UUID.randomUUID().toString()));
        member.setDateNaissance(null);
        member.setTelephone(null);
        member.setBio(null);
        member.setProfilePhotoFilename(null);
        memberRepository.save(member);
    }
}
