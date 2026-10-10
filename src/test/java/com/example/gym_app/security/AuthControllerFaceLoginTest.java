package com.example.gym_app.security;

import com.example.gym_app.access.service.FaceRecognitionService;
import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.security.dto.FaceLoginRequestDTO;
import com.example.gym_app.user.entity.Role;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerFaceLoginTest {

    @Mock
    private FaceRecognitionService faceRecognitionService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController authController;

    @Test
    void shouldIssueTheRecognizedAccountRoleInTheStandardJwtResponse() {
        FaceLoginRequestDTO request = new FaceLoginRequestDTO();
        request.setImageBase64("capture");

        for (Role role : List.of(Role.MEMBER, Role.ADMIN, Role.RECEPTIONIST)) {
            String email = role.name().toLowerCase() + "@example.com";
            when(faceRecognitionService.authenticateAccount("capture"))
                    .thenReturn(Optional.of(new FaceRecognitionService.RecognizedAccount(email, role)));
            when(jwtUtil.generateToken(email, role.name())).thenReturn("token-" + role.name());

            ResponseEntity<AuthResponseDTO> response = authController.faceLogin(request);

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

        ResponseEntity<AuthResponseDTO> response = authController.faceLogin(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
