package com.example.gym_app.classes.service;

import com.example.gym_app.classes.dto.BookingRequestDTO;
import com.example.gym_app.classes.dto.BookingResponseDTO;
import com.example.gym_app.classes.entity.Booking;
import com.example.gym_app.classes.entity.Class_Schedule;
import com.example.gym_app.classes.repository.BookingRepository;
import com.example.gym_app.classes.repository.ClassScheduleRepository;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.exception.ResourceNotFoundException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    private final MemberRepository memberRepository;

    private final ClassScheduleRepository classScheduleRepository;
    private final SecurityUtil securityUtil;

    public BookingService(
            BookingRepository bookingRepository,
            MemberRepository memberRepository,
            ClassScheduleRepository classScheduleRepository,
            SecurityUtil securityUtil) {
        this.bookingRepository = bookingRepository;
        this.memberRepository = memberRepository;
        this.classScheduleRepository = classScheduleRepository;
        this.securityUtil = securityUtil;
    }

    private BookingResponseDTO toDTO(Booking booking) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(booking.getId());
        dto.setMemberId(booking.getMember().getId());
        dto.setMemberNom(booking.getMember().getNom());
        dto.setMemberArchived(booking.getMember().isArchived());
        dto.setScheduleId(booking.getClassSchedule().getId());
        dto.setDateReservation(booking.getDateReservation());
        dto.setStatut(booking.getStatut());
        return dto;
    }

    public List<BookingResponseDTO> findAll() {
        securityUtil.requireStaff();
        return bookingRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Map<UUID, Long> countActiveBySchedule() {
        return bookingRepository.findAll().stream()
                .filter(booking -> !"CANCELLED".equalsIgnoreCase(booking.getStatut()))
                .filter(booking -> !booking.getMember().isArchived())
                .collect(Collectors.groupingBy(booking -> booking.getClassSchedule().getId(), Collectors.counting()));
    }

    public BookingResponseDTO findById(UUID id) {
        securityUtil.requireStaff();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking introuvable avec id: " + id));
        return toDTO(booking);
    }

    public List<BookingResponseDTO> findByMember(UUID memberId) {
        requireMemberAccess(memberId);
        return bookingRepository.findByMemberId(memberId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    private void requireMemberAccess(UUID memberId) {
        if (securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)) {
            return;
        }
        securityUtil.requireRole(Role.MEMBER);
        if (!memberRepository.findById(memberId)
                .map(member -> securityUtil.isCurrentUser(member.getEmail())).orElse(false)) {
            throw new org.springframework.security.access.AccessDeniedException("Acces refuse");
        }
    }

    // Verifie la capacite max du cours avant de creer la reservation
    public BookingResponseDTO create(BookingRequestDTO dto) {
        Member member = memberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId()));
        if (member.isArchived()) {
            throw new ResourceNotFoundException("Member introuvable avec id: " + dto.getMemberId());
        }
        requireMemberAccess(member.getId());
        Class_Schedule schedule = classScheduleRepository.findById(dto.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassSchedule introuvable avec id: " + dto.getScheduleId()));

        // Empeche un membre de reserver deux fois la meme seance
        boolean dejaReserve = bookingRepository.findByMemberId(member.getId()).stream()
                .anyMatch(b -> b.getClassSchedule().getId().equals(schedule.getId())
                        && !"CANCELLED".equalsIgnoreCase(b.getStatut()));
        if (dejaReserve) {
            throw new ConflictException("Vous avez deja reserve cette seance");
        }

        long currentBookings = bookingRepository.findByClassScheduleId(schedule.getId()).stream()
            .filter(booking -> !"CANCELLED".equalsIgnoreCase(booking.getStatut()))
            .filter(booking -> !booking.getMember().isArchived())
            .count();
        if (currentBookings >= schedule.getGymClass().getCapaciteMax()) {
            throw new ConflictException("Capacite maximale atteinte pour ce cours");
        }

        Booking booking = new Booking();
        booking.setMember(member);
        booking.setClassSchedule(schedule);
        booking.setStatut(dto.getStatut());
        booking.setDateReservation(LocalDateTime.now());

        return toDTO(bookingRepository.save(booking));
    }

    public BookingResponseDTO cancel(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking introuvable avec id: " + id));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatut())) {
            throw new ConflictException("Cette reservation est deja annulee");
        }

        // Un Member ne peut annuler que sa propre reservation ; ADMIN/RECEPTIONIST peuvent tout annuler
        if (securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)) {
            booking.setStatut("CANCELLED");
            return toDTO(bookingRepository.save(booking));
        }
        securityUtil.requireRole(Role.MEMBER);
        if (!securityUtil.isCurrentUser(booking.getMember().getEmail())) {
            throw new org.springframework.security.access.AccessDeniedException("Vous ne pouvez annuler que vos propres reservations");
        }

        booking.setStatut("CANCELLED");
        return toDTO(bookingRepository.save(booking));
    }

    public void delete(UUID id) {
        securityUtil.requireStaff();
        bookingRepository.deleteById(id);
    }
}
