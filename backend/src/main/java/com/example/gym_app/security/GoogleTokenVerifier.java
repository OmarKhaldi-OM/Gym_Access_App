package com.example.gym_app.security;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.GoogleAuthenticationUnavailableException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Set;

@Component
public class GoogleTokenVerifier implements GoogleIdentityTokenVerifier {

    private static final String GOOGLE_ISSUER = "https://accounts.google.com";
    private static final Set<String> ACCEPTED_ISSUERS = Set.of(GOOGLE_ISSUER, "accounts.google.com");

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.verifier = clientId == null || clientId.isBlank()
                ? null
                : new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(clientId))
                        .build();
    }

    @Override
    public VerifiedGoogleIdentity verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new BadRequestException("Google credential is missing or invalid");
        }
        if (verifier == null) {
            throw new GoogleAuthenticationUnavailableException("Google sign-in is not configured");
        }

        GoogleIdToken token;
        try {
            token = GoogleIdToken.parse(GsonFactory.getDefaultInstance(), idToken);
        } catch (IOException | IllegalArgumentException e) {
            throw new BadRequestException("Google credential is invalid or expired");
        }

        try {
            if (!verifier.verify(token) || !ACCEPTED_ISSUERS.contains(token.getPayload().getIssuer())) {
                throw new BadRequestException("Google credential is invalid or expired");
            }

            GoogleIdToken.Payload payload = token.getPayload();
            Object verifiedClaim = payload.get("email_verified");
            return new VerifiedGoogleIdentity(
                    GOOGLE_ISSUER,
                    payload.getSubject(),
                    payload.getEmail(),
                    Boolean.TRUE.equals(verifiedClaim),
                    claim(payload, "given_name"),
                    claim(payload, "family_name"),
                    claim(payload, "name"));
        } catch (IOException e) {
            throw new GoogleAuthenticationUnavailableException("Google identity verification is temporarily unavailable", e);
        } catch (GeneralSecurityException e) {
            throw new BadRequestException("Google credential is invalid or expired");
        }
    }

    private String claim(GoogleIdToken.Payload payload, String name) {
        Object value = payload.get(name);
        return value instanceof String stringValue ? stringValue : null;
    }
}
