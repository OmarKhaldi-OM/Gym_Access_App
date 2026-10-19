package com.example.gym_app.security;

import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Staff;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JwtAuthFilterPasswordChangeTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectsJwtIssuedBeforePasswordChangedAt() throws Exception {
        JwtUtil jwtUtil = new JwtUtil();
        org.springframework.test.util.ReflectionTestUtils.setField(
                jwtUtil, "secret", "test-secret-with-at-least-32-characters");
        jwtUtil.initializeKey();

        Staff staff = new Staff();
        staff.setEmail("staff@example.com");
        staff.setMotDePasse("encoded");
        staff.setRole(Role.RECEPTIONIST);
        staff.setPasswordChangedAt(LocalDateTime.now().plusSeconds(1));

        CustomUserDetailsService userDetailsService = mock(CustomUserDetailsService.class);
        when(userDetailsService.loadUserByUsername("staff@example.com"))
                .thenReturn(new CustomUserDetailsService.AccountUserDetails(staff));
        String oldToken = jwtUtil.generateToken("staff@example.com", Role.RECEPTIONIST.name());
        JwtAuthFilter filter = new JwtAuthFilter(jwtUtil, userDetailsService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + oldToken);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }

    @Test
    void acceptsJwtIssuedAfterPasswordChangedAt() throws Exception {
        JwtUtil jwtUtil = new JwtUtil();
        org.springframework.test.util.ReflectionTestUtils.setField(
                jwtUtil, "secret", "test-secret-with-at-least-32-characters");
        jwtUtil.initializeKey();

        Staff staff = new Staff();
        staff.setEmail("staff@example.com");
        staff.setMotDePasse("encoded");
        staff.setRole(Role.RECEPTIONIST);
        staff.setPasswordChangedAt(LocalDateTime.now().minusSeconds(1));

        CustomUserDetailsService userDetailsService = mock(CustomUserDetailsService.class);
        when(userDetailsService.loadUserByUsername("staff@example.com"))
                .thenReturn(new CustomUserDetailsService.AccountUserDetails(staff));
        String freshToken = jwtUtil.generateToken("staff@example.com", Role.RECEPTIONIST.name());
        assertTrue(jwtUtil.isTokenValid(freshToken, staff.getEmail()));
        assertTrue(jwtUtil.isTokenIssuedAfter(freshToken, staff.getPasswordChangedAt()));
        JwtAuthFilter filter = new JwtAuthFilter(jwtUtil, userDetailsService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + freshToken);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilter(request, response, chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        verify(chain).doFilter(request, response);
    }
}
