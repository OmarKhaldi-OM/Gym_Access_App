package com.example.gym_app.security;

import com.example.gym_app.access.controller.FaceRecognitionController;
import com.example.gym_app.access.service.FaceRecognitionService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({MemberController.class, FaceRecognitionController.class})
@AutoConfigureMockMvc(addFilters = true)
@Import({SecurityConfig.class, JwtAuthFilter.class, MemberController.class, FaceRecognitionController.class})
class SecurityConfigAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MemberService memberService;

    @MockitoBean
    private FaceRecognitionService faceRecognitionService;

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
}
