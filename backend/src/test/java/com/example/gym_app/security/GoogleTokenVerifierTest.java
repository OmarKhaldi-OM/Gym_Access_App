package com.example.gym_app.security;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.GoogleAuthenticationUnavailableException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

class GoogleTokenVerifierTest {

    @Test
    void rejectsMalformedTokensWithoutAttemptingNetworkVerification() {
        GoogleTokenVerifier verifier = new GoogleTokenVerifier("test-client-id");

        assertThrows(BadRequestException.class, () -> verifier.verify("not-an-id-token"));
    }

    @Test
    void returnsAnExplicitUnavailableErrorWhenClientIdIsNotConfigured() {
        GoogleTokenVerifier verifier = new GoogleTokenVerifier("");

        assertThrows(GoogleAuthenticationUnavailableException.class, () -> verifier.verify("a.b.c"));
    }
}
