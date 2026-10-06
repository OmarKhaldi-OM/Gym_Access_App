package com.example.gym_app;

import com.example.gym_app.classes.entity.Gym_Class;
import com.example.gym_app.classes.repository.GymClassRepository;
import com.example.gym_app.membership.entity.Membership_Plan;
import com.example.gym_app.membership.repository.MembershipPlanRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.StaffRepository;
import com.example.gym_app.user.repository.TrainerRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private MembershipPlanRepository membershipPlanRepository;

    @Autowired
    private GymClassRepository gymClassRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@gym.com";
    private static final String ADMIN_PASSWORD = "admin1234";
    private static final String RECEPTIONIST_EMAIL = "reception@gym.com";
    private static final String RECEPTIONIST_PASSWORD = "reception1234";

    @Override
    public void run(String... args) {
        seedAdmin();
        seedReceptionist();
        seedTrainers();
        seedMembers();
        seedPlans();
        seedClasses();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            Staff admin = new Staff();
            admin.setNom("Admin");
            admin.setPrenom("Principal");
            admin.setEmail(ADMIN_EMAIL);
            admin.setMotDePasse(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setRole(Role.ADMIN);
            admin.setDateEmbauche(LocalDate.now());
            admin.setDateCreation(LocalDateTime.now());
            staffRepository.save(admin);
            System.out.println(">>> Admin cree : " + ADMIN_EMAIL + " / " + ADMIN_PASSWORD);
        }
    }

    private void seedReceptionist() {
        if (!userRepository.existsByEmail(RECEPTIONIST_EMAIL)) {
            Staff receptionist = new Staff();
            receptionist.setNom("Cherni");
            receptionist.setPrenom("Ines");
            receptionist.setEmail(RECEPTIONIST_EMAIL);
            receptionist.setMotDePasse(passwordEncoder.encode(RECEPTIONIST_PASSWORD));
            receptionist.setRole(Role.RECEPTIONIST);
            receptionist.setDateEmbauche(LocalDate.now());
            receptionist.setDateCreation(LocalDateTime.now());
            staffRepository.save(receptionist);
            System.out.println(">>> Receptionist cree : " + RECEPTIONIST_EMAIL + " / " + RECEPTIONIST_PASSWORD);
        }
    }

    private void seedTrainers() {
        if (!userRepository.existsByEmail("wassim@gym.com")) {
            Trainer trainer = new Trainer();
            trainer.setNom("Jlassi");
            trainer.setPrenom("Wassim");
            trainer.setEmail("wassim@gym.com");
            trainer.setMotDePasse(passwordEncoder.encode("trainer1234"));
            trainer.setRole(Role.TRAINER);
            trainer.setDateEmbauche(LocalDate.of(2023, 6, 1));
            trainer.setSpecialite("Musculation");
            trainer.setDateCreation(LocalDateTime.now());
            trainerRepository.save(trainer);
            System.out.println(">>> Trainer cree : wassim@gym.com / trainer1234");
        }
    }

    private void seedMembers() {
        if (!userRepository.existsByEmail("sara@test.com")) {
            Member member = new Member();
            member.setNom("Ben Ali");
            member.setPrenom("Sara");
            member.setEmail("sara@test.com");
            member.setMotDePasse(passwordEncoder.encode("test1234"));
            member.setRole(Role.MEMBER);
            member.setDateNaissance(LocalDate.of(2000, 5, 14));
            member.setDateInscription(LocalDateTime.now());
            member.setDateCreation(LocalDateTime.now());
            memberRepository.save(member);
            System.out.println(">>> Member cree : sara@test.com / test1234");
        }
    }

    private void seedPlans() {
        if (!membershipPlanRepository.existsByNom("Abonnement Mensuel")) {
            Membership_Plan plan = new Membership_Plan();
            plan.setNom("Abonnement Mensuel");
            plan.setPrix(new BigDecimal("80.00"));
            plan.setDureeJours(30);
            membershipPlanRepository.save(plan);
        }
    }

    private void seedClasses() {
        if (!gymClassRepository.existsByNom("Yoga")) {
            Gym_Class yoga = new Gym_Class();
            yoga.setNom("Yoga");
            yoga.setDescription("Cours de yoga tous niveaux");
            yoga.setCapaciteMax(15);
            gymClassRepository.save(yoga);
        }
    }
}