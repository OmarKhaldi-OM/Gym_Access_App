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
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.Base64;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String ADMIN_EMAIL = "admin@gym.com";
    private static final String RECEPTIONIST_EMAIL = "reception@gym.com";

    private final UserRepository userRepository;

    private final StaffRepository staffRepository;

    private final MemberRepository memberRepository;

    private final TrainerRepository trainerRepository;

    private final MembershipPlanRepository membershipPlanRepository;

    private final GymClassRepository gymClassRepository;

    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            StaffRepository staffRepository,
            MemberRepository memberRepository,
            TrainerRepository trainerRepository,
            MembershipPlanRepository membershipPlanRepository,
            GymClassRepository gymClassRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.memberRepository = memberRepository;
        this.trainerRepository = trainerRepository;
        this.membershipPlanRepository = membershipPlanRepository;
        this.gymClassRepository = gymClassRepository;
        this.passwordEncoder = passwordEncoder;
    }

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
            admin.setMotDePasse(passwordEncoder.encode(seedPassword("SEED_ADMIN_PASSWORD")));
            admin.setRole(Role.ADMIN);
            admin.setDateEmbauche(LocalDate.now());
            admin.setDateCreation(LocalDateTime.now());
            staffRepository.save(admin);
        }
    }

    private void seedReceptionist() {
        if (!userRepository.existsByEmail(RECEPTIONIST_EMAIL)) {
            Staff receptionist = new Staff();
            receptionist.setNom("Cherni");
            receptionist.setPrenom("Ines");
            receptionist.setEmail(RECEPTIONIST_EMAIL);
            receptionist.setMotDePasse(passwordEncoder.encode(seedPassword("SEED_RECEPTIONIST_PASSWORD")));
            receptionist.setRole(Role.RECEPTIONIST);
            receptionist.setDateEmbauche(LocalDate.now());
            receptionist.setDateCreation(LocalDateTime.now());
            staffRepository.save(receptionist);
        }
    }

    private void seedTrainers() {
        if (!userRepository.existsByEmail("wassim@gym.com")) {
            Trainer trainer = new Trainer();
            trainer.setNom("Jlassi");
            trainer.setPrenom("Wassim");
            trainer.setEmail("wassim@gym.com");
            trainer.setMotDePasse(passwordEncoder.encode(seedPassword("SEED_TRAINER_PASSWORD")));
            trainer.setRole(Role.TRAINER);
            trainer.setDateEmbauche(LocalDate.of(2023, 6, 1));
            trainer.setSpecialite("Musculation");
            trainer.setDateCreation(LocalDateTime.now());
            trainerRepository.save(trainer);
        }
    }

    private void seedMembers() {
        if (!userRepository.existsByEmail("sara@test.com")) {
            Member member = new Member();
            member.setNom("Ben Ali");
            member.setPrenom("Sara");
            member.setEmail("sara@test.com");
            member.setMotDePasse(passwordEncoder.encode(seedPassword("SEED_MEMBER_PASSWORD")));
            member.setRole(Role.MEMBER);
            member.setDateNaissance(LocalDate.of(2000, 5, 14));
            member.setDateInscription(LocalDateTime.now());
            member.setDateCreation(LocalDateTime.now());
            memberRepository.save(member);
        }
    }

    private String seedPassword(String environmentVariable) {
        String configuredPassword = System.getenv(environmentVariable);
        if (configuredPassword != null && !configuredPassword.isBlank()) {
            return configuredPassword;
        }

        byte[] randomPassword = new byte[32];
        SECURE_RANDOM.nextBytes(randomPassword);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomPassword);
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