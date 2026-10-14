package com.example.gym_app.security;

import com.example.gym_app.access.service.FaceRecognitionService;
import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.security.dto.FaceLoginRequestDTO;
import com.example.gym_app.security.dto.LoginRequestDTO;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class AuthControllerFaceLoginTest {

    @Mock
    private FaceRecognitionService faceRecognitionService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    @Test
    void shouldIssueFaceLoginJwtForEnrolledMembersAndReceptionists() {
        FaceLoginRequestDTO request = new FaceLoginRequestDTO();
        request.setImageBase64("capture");

        for (Role role : List.of(Role.MEMBER, Role.RECEPTIONIST)) {
            String email = role.name().toLowerCase() + "@example.com";
            when(faceRecognitionService.authenticateAccount("capture"))
                    .thenReturn(Optional.of(new FaceRecognitionService.RecognizedAccount(email, role)));
            when(jwtUtil.generateToken(email, role.name())).thenReturn("token-" + role.name());

            ResponseEntity<?> response = authController.faceLogin(request);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            AuthResponseDTO body = (AuthResponseDTO) response.getBody();
            assertEquals(email, body.getEmail());
            assertEquals(role.name(), body.getRole());
            assertEquals("token-" + role.name(), body.getToken());
        }
    }

    @Test
    void shouldReturnGenericUnauthorizedForAdminFaceLoginByDefault() {
        FaceLoginRequestDTO request = new FaceLoginRequestDTO();
        request.setImageBase64("capture");
        when(faceRecognitionService.authenticateAccount("capture"))
                .thenReturn(Optional.of(new FaceRecognitionService.RecognizedAccount("admin@example.com", Role.ADMIN)));

        ResponseEntity<?> response = authController.faceLogin(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals(Map.of("message", "Email ou mot de passe incorrect"), response.getBody());
    }

    @Test
    void shouldAllowAdminFaceLoginWhenTheGuardIsDisabled() {
        ReflectionTestUtils.setField(authController, "blockAdminFaceLogin", false);
        FaceLoginRequestDTO request = new FaceLoginRequestDTO();
        request.setImageBase64("capture");
        when(faceRecognitionService.authenticateAccount("capture"))
                .thenReturn(Optional.of(new FaceRecognitionService.RecognizedAccount("admin@example.com", Role.ADMIN)));
        when(jwtUtil.generateToken("admin@example.com", Role.ADMIN.name())).thenReturn("admin-token");

        ResponseEntity<?> response = authController.faceLogin(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        AuthResponseDTO body = (AuthResponseDTO) response.getBody();
        assertEquals("admin@example.com", body.getEmail());
        assertEquals("ADMIN", body.getRole());
    }

    @Test
    void passwordLoginReturnsThePersistedAccountRole() {
        for (Role role : Role.values()) {
            String email = role.name().toLowerCase() + "@example.com";
            Member account = new Member();
            account.setEmail(email);
            account.setRole(role);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .thenReturn(UsernamePasswordAuthenticationToken.authenticated(email, null, List.of()));
            when(userRepository.findByEmail(email)).thenReturn(Optional.of(account));
            when(jwtUtil.generateToken(email, role.name())).thenReturn("token-" + role.name());

            LoginRequestDTO request = new LoginRequestDTO();
            request.setEmail(email);
            request.setMotDePasse("password");
            ResponseEntity<AuthResponseDTO> response = authController.login(request);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(email, response.getBody().getEmail());
            assertEquals(role.name(), response.getBody().getRole());
            assertEquals("token-" + role.name(), response.getBody().getToken());
        }
    }

    @Test
    void shouldReturnUnauthorizedWhenNoAccountMatches() {
        FaceLoginRequestDTO request = new FaceLoginRequestDTO();
        request.setImageBase64("unrecognized");
        when(faceRecognitionService.authenticateAccount("unrecognized")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.faceLogin(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
