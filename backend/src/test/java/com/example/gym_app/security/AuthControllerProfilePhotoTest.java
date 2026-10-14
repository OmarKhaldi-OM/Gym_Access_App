package com.example.gym_app.security;

import com.example.gym_app.access.service.FaceRecognitionService;
import com.example.gym_app.security.dto.CurrentUserDTO;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthControllerProfilePhotoTest {

    @TempDir
    Path uploadDirectory;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void currentUserReportsMissingStoredPhotoAsUnavailable() {
        String email = "admin@example.com";
        Member user = new Member();
        user.setId(UUID.randomUUID());
        user.setNom("Admin");
        user.setPrenom("Gym");
        user.setEmail(email);
        user.setRole(Role.ADMIN);
        user.setProfilePhotoFilename("missing.jpg");

        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        AuthController controller = newController(userRepository);
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(email, null, java.util.List.of()));

        ResponseEntity<CurrentUserDTO> response = controller.currentUser();

        assertFalse(response.getBody().isHasProfilePhoto());
    }

    @Test
    void currentUserReportsExistingStoredPhotoAsAvailable() throws Exception {
        String email = "admin@example.com";
        String filename = "profile.jpg";
        Files.write(uploadDirectory.resolve(filename), new byte[] {1});
        Member user = new Member();
        user.setId(UUID.randomUUID());
        user.setNom("Admin");
        user.setPrenom("Gym");
        user.setEmail(email);
        user.setRole(Role.ADMIN);
        user.setProfilePhotoFilename(filename);

        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        AuthController controller = newController(userRepository);
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(email, null, java.util.List.of()));

        ResponseEntity<CurrentUserDTO> response = controller.currentUser();

        assertTrue(response.getBody().isHasProfilePhoto());
    }

    private AuthController newController(UserRepository userRepository) {
        ProfilePhotoStorageService photoStorage = new ProfilePhotoStorageService(uploadDirectory.toString());
        return new AuthController(
                userRepository,
                mock(MemberRepository.class),
                mock(PasswordEncoder.class),
                mock(JwtUtil.class),
                mock(org.springframework.security.authentication.AuthenticationManager.class),
                photoStorage,
                mock(FaceRecognitionService.class));
    }
}
