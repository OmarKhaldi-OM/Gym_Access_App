package com.example.gym_app;

import com.example.gym_app.classes.entity.Booking;
import com.example.gym_app.classes.entity.Class_Schedule;
import com.example.gym_app.classes.entity.Gym_Class;
import com.example.gym_app.classes.repository.BookingRepository;
import com.example.gym_app.classes.repository.ClassScheduleRepository;
import com.example.gym_app.classes.repository.GymClassRepository;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.entity.Subscription;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.membership.repository.SubscriptionRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.TrainerRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class GymAppApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private GymClassRepository gymClassRepository;

    @Autowired
    private ClassScheduleRepository classScheduleRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MembershipPlanRepository membershipPlanRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Test
    void contextLoads() {
        assertTrue(userRepository.existsByEmail("admin@gym.com"));
        assertTrue(membershipPlanRepository.existsByNom("Abonnement Mensuel"));
        assertTrue(gymClassRepository.existsByNom("Yoga"));
    }

    @Test
    @Transactional
    void repositoriesPersistAndLoadRelatedEntities() {
        String suffix = UUID.randomUUID().toString();
        Member member = memberRepository.save(createMember(suffix));
        Trainer trainer = trainerRepository.save(createTrainer(suffix));

        Gym_Class gymClass = new Gym_Class();
        gymClass.setNom("Integration " + suffix);
        gymClass.setCapaciteMax(12);
        gymClass = gymClassRepository.save(gymClass);

        Class_Schedule schedule = new Class_Schedule();
        schedule.setGymClass(gymClass);
        schedule.setTrainer(trainer);
        schedule.setDateHeure(LocalDateTime.now().plusDays(1));
        schedule.setDureeMin(45);
        schedule = classScheduleRepository.save(schedule);

        Booking booking = new Booking();
        booking.setMember(member);
        booking.setClassSchedule(schedule);
        booking.setStatut("CONFIRMED");
        booking = bookingRepository.save(booking);

        Membership_Plan plan = new Membership_Plan();
        plan.setNom("Integration " + suffix);
        plan.setPrix(new BigDecimal("19.99"));
        plan.setDureeJours(30);
        plan = membershipPlanRepository.save(plan);

        Subscription subscription = new Subscription();
        subscription.setMember(member);
        subscription.setMembership_plan(plan);
        subscription.setDateDebut(LocalDate.now());
        subscription.setDateFin(LocalDate.now().plusDays(30));
        subscription.setStatut("ACTIVE");
        subscriptionRepository.save(subscription);

        assertTrue(userRepository.existsByEmail(member.getEmail()));
        assertEquals(1, classScheduleRepository.findByTrainerId(trainer.getId()).size());
        assertEquals(1, bookingRepository.findByMemberId(member.getId()).size());
        assertEquals(1, bookingRepository.countByClassScheduleId(schedule.getId()));
        assertEquals(1, subscriptionRepository.findByMemberId(member.getId()).size());

        bookingRepository.delete(booking);
        assertFalse(bookingRepository.findById(booking.getId()).isPresent());
    }

    private Member createMember(String suffix) {
        Member member = new Member();
        member.setNom("Integration");
        member.setPrenom("Member");
        member.setEmail("integration-member-" + suffix + "@example.com");
        member.setMotDePasse("test-password");
        member.setRole(Role.MEMBER);
        member.setDateInscription(LocalDateTime.now());
        return member;
    }

    private Trainer createTrainer(String suffix) {
        Trainer trainer = new Trainer();
        trainer.setNom("Integration");
        trainer.setPrenom("Trainer");
        trainer.setEmail("integration-trainer-" + suffix + "@example.com");
        trainer.setMotDePasse("test-password");
        trainer.setRole(Role.TRAINER);
        trainer.setDateEmbauche(LocalDate.now());
        trainer.setSpecialite("Integration");
        return trainer;
    }
}
