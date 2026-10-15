package com.example.gym_app.security;

public interface GoogleIdentityTokenVerifier {
    VerifiedGoogleIdentity verify(String idToken);
}
