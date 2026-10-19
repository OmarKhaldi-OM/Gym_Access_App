package com.example.gym_app.security;

import com.example.gym_app.access.controller.FaceRecognitionController;
import com.example.gym_app.access.service.FaceRecognitionService;
import com.example.gym_app.membership.controller.SubscriptionController;
import com.example.gym_app.membership.controller.MembershipPlanController;
import com.example.gym_app.membership.dto.SubscriptionResponseDTO;
import com.example.gym_app.membership.service.MembershipPlanService;
import com.example.gym_app.membership.service.SubscriptionService;
import com.example.gym_app.training.controller.CoachNoteController;
import com.example.gym_app.training.controller.MemberGoalController;
import com.example.gym_app.training.controller.ProgressLogController;
import com.example.gym_app.training.service.CoachNoteService;
import com.example.gym_app.training.service.MemberGoalService;
import com.example.gym_app.training.service.ProgressLogService;
import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.user.controller.MemberController;
import com.example.gym_app.user.controller.StaffController;
import com.example.gym_app.user.controller.TrainerController;
import com.example.gym_app.user.service.MemberService;
import com.example.gym_app.user.service.StaffService;
import com.example.gym_app.user.service.TrainerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.when;

@WebMvcTest({MemberController.class, StaffController.class, TrainerController.class, FaceRecognitionController.class, GoogleAuthController.class, SubscriptionController.class, MembershipPlanController.class, MemberGoalController.class, ProgressLogController.class, CoachNoteController.class})
@AutoConfigureMockMvc(addFilters = true)
@Import({SecurityConfig.class, JwtAuthFilter.class, MemberController.class, StaffController.class, TrainerController.class, FaceRecognitionController.class, GoogleAuthController.class, SubscriptionController.class, MembershipPlanController.class, MemberGoalController.class, ProgressLogController.class, CoachNoteController.class})
class SecurityConfigAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MemberService memberService;

    @MockitoBean
    private StaffService staffService;

    @MockitoBean
    private TrainerService trainerService;

    @MockitoBean
    private FaceRecognitionService faceRecognitionService;

    @MockitoBean
    private GoogleAuthService googleAuthService;

    @MockitoBean
    private SubscriptionService subscriptionService;

    @MockitoBean
    private MembershipPlanService membershipPlanService;

    @MockitoBean
    private MemberGoalService memberGoalService;

    @MockitoBean
    private ProgressLogService progressLogService;

    @MockitoBean
    private CoachNoteService coachNoteService;

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
    void staffPasswordResetIsAdminOnlyAndRejectsShortPasswords() throws Exception {
        UUID staffId = UUID.randomUUID();
        String endpoint = "/api/staff/" + staffId + "/password";
        String validBody = "{\"newPassword\":\"a-long-enough-password\"}";

        mockMvc.perform(put(endpoint)
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isNoContent());

        mockMvc.perform(put(endpoint)
                        .with(user("reception").roles("RECEPTIONIST"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isForbidden());
        mockMvc.perform(put(endpoint)
                        .with(user("trainer").roles("TRAINER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isForbidden());
        mockMvc.perform(put(endpoint)
                        .with(user("member").roles("MEMBER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validBody))
                .andExpect(status().isForbidden());

        mockMvc.perform(put(endpoint)
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newPassword\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void trainerCanReadTheMemberProfileGoalsAndProgressEndpoints() throws Exception {
        UUID memberId = UUID.randomUUID();
        when(memberGoalService.findByMember(memberId)).thenReturn(java.util.List.of());
        when(progressLogService.findByMember(memberId)).thenReturn(java.util.List.of());

        mockMvc.perform(get("/api/members/{id}", memberId).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/member-goals/member/{id}", memberId).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/progress-logs/member/{id}", memberId).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/coach-notes/member/{id}", memberId).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isOk());
    }

    @Test
    void coachReceivesForbiddenForAnUnassociatedMember() throws Exception {
        UUID memberId = UUID.randomUUID();
        when(memberService.findById(memberId)).thenThrow(new AccessDeniedException("Acces refuse"));
        when(memberGoalService.findByMember(memberId)).thenThrow(new AccessDeniedException("Acces refuse"));
        when(progressLogService.findByMember(memberId)).thenThrow(new AccessDeniedException("Acces refuse"));

        mockMvc.perform(get("/api/members/{id}", memberId).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/member-goals/member/{id}", memberId).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/progress-logs/member/{id}", memberId).with(user("trainer").roles("TRAINER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void receptionistProfileAccessRemainsAndOtherRolesCannotReadCoachOnlyData() throws Exception {
        UUID memberId = UUID.randomUUID();
        mockMvc.perform(get("/api/members/{id}", memberId).with(user("reception").roles("RECEPTIONIST")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/member-goals/member/{id}", memberId).with(user("reception").roles("RECEPTIONIST")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/progress-logs/member/{id}", memberId).with(user("reception").roles("RECEPTIONIST")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/coach-notes/member/{id}", memberId).with(user("member").roles("MEMBER")))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/member-goals/member/{id}", memberId)
                        .with(user("trainer").roles("TRAINER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/progress-logs")
                        .with(user("trainer").roles("TRAINER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
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
    void membershipEnrollmentRequiresAuthenticationAndMemberRole() throws Exception {
        String body = "{\"planId\":\"" + UUID.randomUUID() + "\"}";
        mockMvc.perform(post("/api/subscriptions/enroll")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/subscriptions/enroll")
                        .with(user("trainer").roles("TRAINER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void memberCanEnrollOnlyThroughTheCurrentMemberEndpoint() throws Exception {
        String planId = UUID.randomUUID().toString();
        when(subscriptionService.enrollCurrentMember(org.mockito.ArgumentMatchers.any()))
                .thenReturn(new SubscriptionResponseDTO());

        mockMvc.perform(post("/api/subscriptions/enroll")
                        .with(user("member").roles("MEMBER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"planId\":\"" + planId + "\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/subscriptions")
                        .with(user("member").roles("MEMBER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"memberId\":\"" + UUID.randomUUID()
                                + "\",\"planId\":\"" + planId
                                + "\",\"dateDebut\":\"2026-10-15\",\"dateFin\":\"2026-11-15\",\"statut\":\"ACTIVE\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void planManagementListIsStaffOnly() throws Exception {
        mockMvc.perform(get("/api/plans/manage"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/plans/manage").with(user("member").roles("MEMBER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void staffAccountManagementRequiresAdminForDirectApiRequests() throws Exception {
        mockMvc.perform(get("/api/staff"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/staff").with(user("reception").roles("RECEPTIONIST")))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/trainers")
                        .with(user("member").roles("MEMBER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/staff")
                        .with(user("reception").roles("RECEPTIONIST"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void publicPlanListRemainsAvailableWithoutAuthentication() throws Exception {
        when(membershipPlanService.findAll()).thenReturn(java.util.List.of());
        mockMvc.perform(get("/api/plans"))
                .andExpect(status().isOk());
    }

    @Test
    void viteAndTunnelOriginsAreAllowedByCors() throws Exception {
        for (String origin : new String[] {
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://demo-tunnel.trycloudflare.com"
        }) {
            mockMvc.perform(options("/api/auth/google")
                            .header("Origin", origin)
                            .header("Access-Control-Request-Method", "POST"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", origin));
        }
    }
}
