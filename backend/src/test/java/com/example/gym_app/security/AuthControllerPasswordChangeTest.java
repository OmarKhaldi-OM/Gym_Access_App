package com.example.gym_app.security;

import com.example.gym_app.access.service.FaceRecognitionService;
import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerPasswordChangeTest {

    @Mock private UserRepository userRepository;
    @Mock private MemberRepository memberRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private ProfilePhotoStorageService profilePhotoStorageService;
    @Mock private FaceRecognitionService faceRecognitionService;

    @InjectMocks private AuthController authController;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void changesOwnPasswordAfterCheckingCurrentPassword() {
        String email = "staff@example.com";
        Staff account = new Staff();
        account.setId(UUID.randomUUID());
        account.setEmail(email);
        account.setRole(Role.RECEPTIONIST);
        account.setMotDePasse("old-hash");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        email, null, List.of(new SimpleGrantedAuthority(Role.RECEPTIONIST.authority()))));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("current-password", "old-hash")).thenReturn(true);
        when(passwordEncoder.encode("new-password-10")).thenReturn("new-hash");

        var response = authController.changeOwnPassword(passwordChangeRequest());

        assertEquals(204, response.getStatusCode().value());
        assertEquals("new-hash", account.getMotDePasse());
        assertNotNull(account.getPasswordChangedAt());
        verify(userRepository).save(account);
    }

    @Test
    void rejectsOwnPasswordChangeWhenCurrentPasswordDoesNotMatch() {
        String email = "member@example.com";
        Staff account = new Staff();
        account.setEmail(email);
        account.setMotDePasse("old-hash");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("current-password", "old-hash")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authController.changeOwnPassword(passwordChangeRequest()));
        verify(userRepository, never()).save(any());
        verify(passwordEncoder, never()).encode(any());
    }

    private com.example.gym_app.security.dto.ChangePasswordRequestDTO passwordChangeRequest() {
        var request = new com.example.gym_app.security.dto.ChangePasswordRequestDTO();
        request.setCurrentPassword("current-password");
        request.setNewPassword("new-password-10");
        return request;
    }
}
