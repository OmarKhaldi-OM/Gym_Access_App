package com.example.gym_app.security;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.user.entity.GoogleIdentity;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.User;
import com.example.gym_app.user.repository.GoogleIdentityRepository;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.UserRepository;
import com.example.gym_app.security.dto.AuthResponseDTO;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Locale;
import java.util.UUID;

@Service
public class GoogleAuthService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthService.class);
    private static final String ACCOUNT_CONFLICT_MESSAGE =
            "Unable to use this Google account. If you already have a Gate account, sign in and link Google from your member profile.";

    private final GoogleIdentityTokenVerifier tokenVerifier;
    private final GoogleIdentityRepository googleIdentityRepository;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public GoogleAuthService(
            GoogleIdentityTokenVerifier tokenVerifier,
            GoogleIdentityRepository googleIdentityRepository,
            UserRepository userRepository,
            MemberRepository memberRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.tokenVerifier = tokenVerifier;
        this.googleIdentityRepository = googleIdentityRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponseDTO authenticate(String idToken) {
        VerifiedGoogleIdentity identity = verifiedIdentity(idToken);
        var linkedIdentity = googleIdentityRepository.findByIssuerAndSubject(identity.issuer(), identity.subject());
        if (linkedIdentity.isPresent()) {
            User user = linkedIdentity.get().getUser();
            if (!(user instanceof Member member) || member.getRole() != Role.MEMBER || member.isArchived()) {
                logger.warn("Google sign-in conflict: identity is linked to an ineligible Gate account");
                throw new ConflictException(ACCOUNT_CONFLICT_MESSAGE);
            }
            return authenticated(member);
        }

        String email = identity.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            logger.warn("Google sign-in conflict: verified email exists without a matching Google identity");
            throw new ConflictException(ACCOUNT_CONFLICT_MESSAGE);
        }

        String[] names = memberNames(identity);
        Member member = new Member();
        member.setPrenom(names[0]);
        member.setNom(names[1]);
        member.setEmail(email);
        member.setMotDePasse(passwordEncoder.encode(UUID.randomUUID().toString()));
        member.setRole(Role.MEMBER);

        try {
            member = memberRepository.saveAndFlush(member);
            saveIdentity(member, identity);
        } catch (DataIntegrityViolationException e) {
            logger.warn("Google sign-in conflict while saving a member or Google identity ({})",
                    e.getClass().getSimpleName());
            throw new ConflictException(ACCOUNT_CONFLICT_MESSAGE);
        }
        return authenticated(member);
    }

    @Transactional
    public void link(String currentEmail, String idToken) {
        VerifiedGoogleIdentity identity = verifiedIdentity(idToken);
        User currentUser = userRepository.findByEmailIgnoreCase(currentEmail)
                .orElseThrow(() -> new AccessDeniedException("Member account required"));
        if (!(currentUser instanceof Member member) || member.getRole() != Role.MEMBER || member.isArchived()) {
            throw new AccessDeniedException("Member account required");
        }

        var existingIdentity = googleIdentityRepository.findByIssuerAndSubject(identity.issuer(), identity.subject());
        if (existingIdentity.isPresent()) {
            if (existingIdentity.get().getUser().getId().equals(member.getId())) return;
            throw new ConflictException(ACCOUNT_CONFLICT_MESSAGE);
        }
        if (googleIdentityRepository.existsByUserId(member.getId())) {
            throw new ConflictException("A Google account is already linked to this Gate account.");
        }
        try {
            saveIdentity(member, identity);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException(ACCOUNT_CONFLICT_MESSAGE);
        }
    }

    @Transactional(readOnly = true)
    public boolean isLinked(String currentEmail) {
        User currentUser = userRepository.findByEmailIgnoreCase(currentEmail)
                .orElseThrow(() -> new AccessDeniedException("Member account required"));
        if (!(currentUser instanceof Member member) || member.getRole() != Role.MEMBER || member.isArchived()) {
            throw new AccessDeniedException("Member account required");
        }
        return googleIdentityRepository.existsByUserId(member.getId());
    }

    private VerifiedGoogleIdentity verifiedIdentity(String idToken) {
        VerifiedGoogleIdentity identity = tokenVerifier.verify(idToken);
        if (identity.subject() == null || identity.subject().isBlank()
                || identity.email() == null || identity.email().isBlank()
                || !identity.emailVerified()) {
            throw new BadRequestException("Google must provide a verified email address");
        }
        return identity;
    }

    private String[] memberNames(VerifiedGoogleIdentity identity) {
        String givenName = clean(identity.givenName());
        String familyName = clean(identity.familyName());
        if (givenName != null && familyName != null) return new String[] {givenName, familyName};

        String fullName = clean(identity.fullName());
        if (fullName != null) {
            String[] parts = fullName.split("\\s+", 2);
            if (givenName == null) givenName = parts[0];
            if (familyName == null && parts.length > 1) familyName = parts[1];
        }
        if (familyName == null && givenName != null) familyName = givenName;
        if (givenName == null || familyName == null) {
            throw new BadRequestException("Google did not provide the name details required to create a member account");
        }
        return new String[] {givenName, familyName};
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private void saveIdentity(Member member, VerifiedGoogleIdentity identity) {
        GoogleIdentity googleIdentity = new GoogleIdentity();
        googleIdentity.setUser(member);
        googleIdentity.setIssuer(identity.issuer());
        googleIdentity.setSubject(identity.subject());
        googleIdentityRepository.saveAndFlush(googleIdentity);
    }

    private AuthResponseDTO authenticated(Member member) {
        return new AuthResponseDTO(jwtUtil.generateToken(member.getEmail(), Role.MEMBER.name()),
                member.getEmail(), Role.MEMBER.name());
    }
}
