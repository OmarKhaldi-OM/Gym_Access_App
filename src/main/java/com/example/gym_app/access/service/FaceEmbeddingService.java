package com.example.gym_app.access.service;

import com.example.gym_app.access.dto.FaceEmbeddingRequestDTO;
import com.example.gym_app.access.dto.FaceEmbeddingResponseDTO;
import com.example.gym_app.access.entity.Face_Embedding;
import com.example.gym_app.access.repository.FaceEmbeddingRepository;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FaceEmbeddingService {

    private final FaceEmbeddingRepository faceEmbeddingRepository;

    private final MemberRepository memberRepository;
    private final SecurityUtil securityUtil;

    public FaceEmbeddingService(
            FaceEmbeddingRepository faceEmbeddingRepository,
            MemberRepository memberRepository,
            SecurityUtil securityUtil) {
        this.faceEmbeddingRepository = faceEmbeddingRepository;
        this.memberRepository = memberRepository;
        this.securityUtil = securityUtil;
    }

    private FaceEmbeddingResponseDTO toDTO(Face_Embedding fe) {
        FaceEmbeddingResponseDTO dto = new FaceEmbeddingResponseDTO();
        dto.setId(fe.getId());
        dto.setMemberId(fe.getMember().getId());
        dto.setDateEnregistrement(fe.getDateEnregistrement());
        return dto;
    }

    private Face_Embedding toEntity(FaceEmbeddingRequestDTO dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId()));

        Face_Embedding fe = new Face_Embedding();
        fe.setMember(member);
        fe.setVecteurFacial(dto.getVecteurFacial());
        fe.setDateEnregistrement(LocalDateTime.now());
        return fe;
    }

    public List<FaceEmbeddingResponseDTO> findByMember(UUID memberId) {
        securityUtil.requireStaff();
        return faceEmbeddingRepository.findByMemberId(memberId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public FaceEmbeddingResponseDTO enroll(FaceEmbeddingRequestDTO dto) {
        securityUtil.requireStaff();
        return toDTO(faceEmbeddingRepository.save(toEntity(dto)));
    }

    public void delete(UUID id) {
        securityUtil.requireStaff();
        faceEmbeddingRepository.deleteById(id);
    }
}
