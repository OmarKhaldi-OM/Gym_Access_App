package com.example.gym_app.security;

import com.example.gym_app.access.controller.FaceRecognitionController;
import com.example.gym_app.access.service.FaceRecognitionService;
import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.user.controller.MemberController;
import com.example.gym_app.user.service.MemberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when;

@WebMvcTest({MemberController.class, FaceRecognitionController.class, GoogleAuthController.class})
@AutoConfigureMockMvc(addFilters = true)
@Import({SecurityConfig.class, JwtAuthFilter.class, MemberController.class, FaceRecognitionController.class, GoogleAuthController.class})
class SecurityConfigAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MemberService memberService;

    @MockitoBean
    private FaceRecognitionService faceRecognitionService;

    @MockitoBean
    private GoogleAuthService googleAuthService;

    @MockitoBean
    private CustomUserDetailsService userDetailsService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @Test
    void protectedMemberRouteReturnsUnauthorizedWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/members/{id}", UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void memberRouteReturnsForbiddenForTrainer() throws Exception {
        mockMvc.perform(get("/api/members/{id}", UUID.randomUUID()).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void memberRoleMayEnterTheMemberRoute() throws Exception {
        mockMvc.perform(get("/api/members/{id}", UUID.randomUUID()).with(user("member").roles("MEMBER")))
                .andExpect(status().isOk());
    }

    @Test
    void accountFaceEnrollmentIsForbiddenForTrainer() throws Exception {
        mockMvc.perform(post("/api/face-recognition/enroll-account")
                        .with(user("trainer").roles("TRAINER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"imageBase64\":\"capture\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void accountFaceEnrollmentIsAvailableToMember() throws Exception {
        mockMvc.perform(post("/api/face-recognition/enroll-account")
                        .with(user("member").roles("MEMBER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"imageBase64\":\"capture\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void googleAuthenticationEndpointIsPublic() throws Exception {
        when(googleAuthService.authenticate("credential"))
                .thenReturn(new AuthResponseDTO("gate-token", "member@example.com", "MEMBER"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"credential\":\"credential\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void googleAccountLinkingRequiresAnAuthenticatedGateSession() throws Exception {
        mockMvc.perform(post("/api/auth/google/link")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"credential\":\"credential\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void localViteOriginsAreAllowedByCors() throws Exception {
        for (String origin : new String[] {"http://localhost:5173", "http://127.0.0.1:5173"}) {
            mockMvc.perform(options("/api/auth/google")
                            .header("Origin", origin)
                            .header("Access-Control-Request-Method", "POST"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin));
        }
    }
}
