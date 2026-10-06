package com.example.gym_app.access.service;

import com.example.gym_app.access.dto.AccessLogRequestDTO;
import com.example.gym_app.access.dto.AccessLogResponseDTO;
import com.example.gym_app.access.entity.Access_Log;
import com.example.gym_app.access.repository.AccessLogRepository;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.StaffRepository;
import com.example.gym_app.security.SecurityUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AccessLogService {

    @Autowired
    private AccessLogRepository accessLogRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private SecurityUtil securityUtil;

    private AccessLogResponseDTO toDTO(Access_Log log) {
        AccessLogResponseDTO dto = new AccessLogResponseDTO();
        dto.setId(log.getId());
        dto.setMemberId(log.getMember().getId());
        dto.setMemberNom(log.getMember().getNom());
        dto.setStaffId(log.getStaff() != null ? log.getStaff().getId() : null);
        dto.setHorodatage(log.getHorodatage());
        dto.setResultat(log.getResultat());
        dto.setScoreConfiance(log.getScoreConfiance());
        dto.setTypeAcces(log.getTypeAcces());
        return dto;
    }

    private Access_Log toEntity(AccessLogRequestDTO dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId()));

        Access_Log log = new Access_Log();
        log.setMember(member);
        if (dto.getStaffId() != null) {
            Staff staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff introuvable avec id: " + dto.getStaffId()));
            log.setStaff(staff);
        }
        log.setResultat(dto.getResultat());
        log.setScoreConfiance(dto.getScoreConfiance());
        log.setHorodatage(LocalDateTime.now());
        log.setTypeAcces(dto.getTypeAcces());
        return log;
    }

    public List<AccessLogResponseDTO> findAll() {
        return accessLogRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AccessLogResponseDTO> findByMember(UUID memberId) {
        boolean staff = securityUtil.hasRole(Role.ADMIN) || securityUtil.hasRole(Role.RECEPTIONIST);
        if (!staff && !memberRepository.findById(memberId)
                .map(member -> member.getEmail().equals(securityUtil.getCurrentUserEmail())).orElse(false)) {
            throw new AccessDeniedException("Acces refuse");
        }
        return accessLogRepository.findByMemberId(memberId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AccessLogResponseDTO> findByPeriode(LocalDateTime start, LocalDateTime end) {
        return accessLogRepository.findByHorodatageBetween(start, end).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AccessLogResponseDTO create(AccessLogRequestDTO dto) {
        return toDTO(accessLogRepository.save(toEntity(dto)));
    }
}
