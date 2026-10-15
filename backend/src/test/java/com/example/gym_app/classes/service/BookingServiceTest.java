package com.example.gym_app.classes.service;

import com.example.gym_app.classes.dto.BookingRequestDTO;
import com.example.gym_app.classes.entity.Booking;
import com.example.gym_app.classes.entity.Class_Schedule;
import com.example.gym_app.classes.entity.Gym_Class;
import com.example.gym_app.classes.repository.BookingRepository;
import com.example.gym_app.classes.repository.ClassScheduleRepository;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ClassScheduleRepository classScheduleRepository;

    @Mock
    private SecurityUtil securityUtil;

    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingService = new BookingService(
                bookingRepository,
                memberRepository,
                classScheduleRepository,
                securityUtil);
    }

    @Test
    void cancelledBookingDoesNotPreventDuplicateOrConsumeCapacity() {
        UUID memberId = UUID.randomUUID();
        UUID scheduleId = UUID.randomUUID();
        Member member = new Member();
        member.setId(memberId);
        member.setNom("Member");
        Class_Schedule schedule = new Class_Schedule();
        schedule.setId(scheduleId);
        Gym_Class gymClass = new Gym_Class();
        gymClass.setCapaciteMax(1);
        schedule.setGymClass(gymClass);
        Booking cancelledBooking = new Booking();
        cancelledBooking.setMember(member);
        cancelledBooking.setClassSchedule(schedule);
        cancelledBooking.setStatut("CANCELLED");

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)).thenReturn(true);
        when(classScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));
        when(bookingRepository.findByMemberId(memberId)).thenReturn(List.of(cancelledBooking));
        when(bookingRepository.findByClassScheduleId(scheduleId)).thenReturn(List.of(cancelledBooking));
        when(bookingRepository.findAll()).thenReturn(List.of(cancelledBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingRequestDTO request = new BookingRequestDTO();
        request.setMemberId(memberId);
        request.setScheduleId(scheduleId);
        request.setStatut("CONFIRMED");

        bookingService.create(request);

        ArgumentCaptor<Booking> savedBooking = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(savedBooking.capture());
        assertEquals("CONFIRMED", savedBooking.getValue().getStatut());
        assertEquals(Map.of(), bookingService.countActiveBySchedule());
    }

    @Test
    void rejectsBookingWhenClassCapacityIsReached() {
        UUID memberId = UUID.randomUUID();
        UUID scheduleId = UUID.randomUUID();
        Member member = new Member();
        member.setId(memberId);

        Class_Schedule schedule = new Class_Schedule();
        schedule.setId(scheduleId);
        Gym_Class gymClass = new Gym_Class();
        gymClass.setCapaciteMax(1);
        schedule.setGymClass(gymClass);

        Booking existingBooking = new Booking();
        Member existingMember = new Member();
        existingMember.setId(UUID.randomUUID());
        existingBooking.setMember(existingMember);
        existingBooking.setClassSchedule(schedule);
        existingBooking.setStatut("CONFIRMED");

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)).thenReturn(true);
        when(classScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));
        when(bookingRepository.findByMemberId(memberId)).thenReturn(List.of());
        when(bookingRepository.findByClassScheduleId(scheduleId)).thenReturn(List.of(existingBooking));

        BookingRequestDTO request = new BookingRequestDTO();
        request.setMemberId(memberId);
        request.setScheduleId(scheduleId);
        request.setStatut("CONFIRMED");

        assertThrows(ConflictException.class, () -> bookingService.create(request));
    }

    @Test
    void rejectsDuplicateActiveBookingForSameMemberAndSchedule() {
        UUID memberId = UUID.randomUUID();
        UUID scheduleId = UUID.randomUUID();
        Member member = new Member();
        member.setId(memberId);

        Class_Schedule schedule = new Class_Schedule();
        schedule.setId(scheduleId);
        Gym_Class gymClass = new Gym_Class();
        gymClass.setCapaciteMax(10);
        schedule.setGymClass(gymClass);

        Booking existingBooking = new Booking();
        existingBooking.setMember(member);
        existingBooking.setClassSchedule(schedule);
        existingBooking.setStatut("CONFIRMED");

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(securityUtil.hasAnyRole(Role.ADMIN, Role.RECEPTIONIST)).thenReturn(true);
        when(classScheduleRepository.findById(scheduleId)).thenReturn(Optional.of(schedule));
        when(bookingRepository.findByMemberId(memberId)).thenReturn(List.of(existingBooking));

        BookingRequestDTO request = new BookingRequestDTO();
        request.setMemberId(memberId);
        request.setScheduleId(scheduleId);
        request.setStatut("CONFIRMED");

        assertThrows(ConflictException.class, () -> bookingService.create(request));
    }
}
