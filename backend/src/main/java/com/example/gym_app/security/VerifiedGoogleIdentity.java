package com.example.gym_app.security;

public record VerifiedGoogleIdentity(
        String issuer,
        String subject,
        String email,
        boolean emailVerified,
        String givenName,
        String familyName,
        String fullName) {
}
