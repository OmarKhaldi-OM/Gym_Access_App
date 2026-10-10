package com.example.gym_app.user.service;

import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.user.dto.MemberRequestDTO;
import com.example.gym_app.user.dto.MemberResponseDTO;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtil securityUtil;


    // ---- Mapping entite -> DTO ----

    public MemberService(
            MemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            SecurityUtil securityUtil) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.securityUtil = securityUtil;
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
        return memberRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MemberResponseDTO findById(UUID id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + id));
        if (!securityUtil.hasRole(Role.ADMIN) && !securityUtil.hasRole(Role.RECEPTIONIST)
            && !member.getEmail().equals(securityUtil.getCurrentUserEmail())) {
            throw new AccessDeniedException("Acces refuse");
        }
        return toDTO(member);
    }

    public MemberResponseDTO create(MemberRequestDTO dto) {
        Member saved = memberRepository.save(toEntity(dto));
        return toDTO(saved);
    }

    public MemberResponseDTO update(UUID id, MemberRequestDTO dto) {
        Member existing = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + id));
        existing.setNom(dto.getNom());
        existing.setPrenom(dto.getPrenom());
        existing.setEmail(dto.getEmail());
        existing.setDateNaissance(dto.getDateNaissance());
        return toDTO(memberRepository.save(existing));
    }

    public void delete(UUID id) {
        memberRepository.deleteById(id);
    }
}
