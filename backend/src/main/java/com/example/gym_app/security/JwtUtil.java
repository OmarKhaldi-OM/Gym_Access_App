package com.example.gym_app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;
    private SecretKey key;

    @PostConstruct
    void initializeKey() {
        if (secret == null || secret.isBlank() || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 characters");
        }
        key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24h

    public String generateToken(String email, String role) {
        Date issuedAt = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("issuedAtMillis", issuedAt.getTime())
                .issuedAt(issuedAt)
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public boolean isTokenValid(String token, String email) {
        return extractEmail(token).equals(email) && !isTokenExpired(token);
    }

    public boolean isTokenIssuedAfter(String token, LocalDateTime timestamp) {
        Claims claims = extractClaims(token);
        Object issuedAtClaim = claims.get("issuedAtMillis");
        Date issuedAt = claims.getIssuedAt();
        long issuedAtTime = issuedAtClaim instanceof Number issuedAtMillis
                ? issuedAtMillis.longValue()
                : issuedAtClaim == null && issuedAt != null ? issuedAt.getTime() : Long.MIN_VALUE;
        long changedAtTime = timestamp.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
        return issuedAtTime > changedAtTime;
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractClaims(token));
    }

    private Claims extractClaims(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }
}