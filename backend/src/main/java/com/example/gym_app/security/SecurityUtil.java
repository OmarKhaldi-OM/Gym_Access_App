package com.example.gym_app.security;

import com.example.gym_app.user.entity.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Objects;

@Component
public class SecurityUtil {

    // Renvoie l'email de l'utilisateur actuellement connecte (extrait du token JWT)
    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Aucun utilisateur authentifie");
        }
        return authentication.getName();
    }

    public boolean hasRole(Role role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(role.authority()));
    }

    public boolean hasAnyRole(Role... roles) {
        return Arrays.stream(roles).anyMatch(this::hasRole);
    }

    public boolean isCurrentUser(String email) {
        return Objects.equals(email, getCurrentUserEmail());
    }

    public void requireRole(Role... roles) {
        if (!hasAnyRole(roles)) {
            throw new AccessDeniedException("Acces refuse");
        }
    }

    public void requireStaff() {
        requireRole(Role.ADMIN, Role.RECEPTIONIST);
    }
}