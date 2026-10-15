package com.example.gym_app.security;

import com.example.gym_app.exception.BadRequestException;
import com.example.gym_app.exception.ConflictException;
import com.example.gym_app.security.dto.AuthResponseDTO;
import com.example.gym_app.user.entity.GoogleIdentity;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Staff;
import com.example.gym_app.user.repository.GoogleIdentityRepository;
import com.example.gym_app.user.repository.MemberRepository;
import com.example.gym_app.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAuthServiceTest {

    private static final String EMAIL = "member@example.com";
    private static final String ISSUER = "https://accounts.google.com";
    private static final String SUBJECT = "stable-google-subject";

    @Mock private GoogleIdentityTokenVerifier tokenVerifier;
    @Mock private GoogleIdentityRepository identityRepository;
    @Mock private UserRepository userRepository;
    @Mock private MemberRepository memberRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    private GoogleAuthService service;

    @BeforeEach
    void setUp() {
        service = new GoogleAuthService(tokenVerifier, identityRepository, userRepository,
                memberRepository, passwordEncoder, jwtUtil);
    }

    @Test
    void registersNewMemberWithOnlyVerifiedGoogleClaimsAndIssuesGateJwt() {
        when(tokenVerifier.verify("google-id-token")).thenReturn(verifiedIdentity());
        when(identityRepository.findByIssuerAndSubject(ISSUER, SUBJECT)).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("opaque-password-hash");
        when(memberRepository.saveAndFlush(any(Member.class))).thenAnswer(invocation -> {
            Member member = invocation.getArgument(0);
            member.setId(UUID.randomUUID());
            return member;
        });
        when(jwtUtil.generateToken(EMAIL, Role.MEMBER.name())).thenReturn("gate-jwt");

        AuthResponseDTO response = service.authenticate("google-id-token");

        assertEquals("gate-jwt", response.getToken());
        assertEquals(EMAIL, response.getEmail());
        assertEquals(Role.MEMBER.name(), response.getRole());
        ArgumentCaptor<Member> memberCaptor = ArgumentCaptor.forClass(Member.class);
        verify(memberRepository).saveAndFlush(memberCaptor.capture());
        Member created = memberCaptor.getValue();
        assertEquals("Ada", created.getPrenom());
        assertEquals("Lovelace", created.getNom());
        assertEquals(Role.MEMBER, created.getRole());
        assertEquals("opaque-password-hash", created.getMotDePasse());
        ArgumentCaptor<GoogleIdentity> identityCaptor = ArgumentCaptor.forClass(GoogleIdentity.class);
        verify(identityRepository).saveAndFlush(identityCaptor.capture());
        assertEquals(ISSUER, identityCaptor.getValue().getIssuer());
        assertEquals(SUBJECT, identityCaptor.getValue().getSubject());
    }

    @Test
    void signsInAnAlreadyLinkedMemberWithoutCreatingAnotherAccount() {
        Member member = member();
        GoogleIdentity linkedIdentity = linkedIdentity(member);
        when(tokenVerifier.verify("google-id-token")).thenReturn(verifiedIdentity());
        when(identityRepository.findByIssuerAndSubject(ISSUER, SUBJECT)).thenReturn(Optional.of(linkedIdentity));
        when(jwtUtil.generateToken(EMAIL, Role.MEMBER.name())).thenReturn("gate-jwt");

        AuthResponseDTO response = service.authenticate("google-id-token");

        assertEquals("gate-jwt", response.getToken());
        verify(memberRepository, never()).saveAndFlush(any(Member.class));
        verify(identityRepository, never()).saveAndFlush(any(GoogleIdentity.class));
    }

    @Test
    void refusesEmailOnlyLinkingToAnExistingGateAccount() {
        when(tokenVerifier.verify("google-id-token")).thenReturn(verifiedIdentity());
        when(identityRepository.findByIssuerAndSubject(ISSUER, SUBJECT)).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(member()));

        assertThrows(ConflictException.class, () -> service.authenticate("google-id-token"));
        verify(memberRepository, never()).saveAndFlush(any(Member.class));
    }

    @Test
    void reportsConcurrentDuplicateRegistrationAsConflict() {
        when(tokenVerifier.verify("google-id-token")).thenReturn(verifiedIdentity());
        when(identityRepository.findByIssuerAndSubject(ISSUER, SUBJECT)).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("opaque-password-hash");
        when(memberRepository.saveAndFlush(any(Member.class))).thenAnswer(invocation -> {
            Member member = invocation.getArgument(0);
            member.setId(UUID.randomUUID());
            return member;
        });
        when(identityRepository.saveAndFlush(any(GoogleIdentity.class)))
                .thenThrow(new DataIntegrityViolationException("unique identity constraint"));

        assertThrows(ConflictException.class, () -> service.authenticate("google-id-token"));
    }

    @Test
    void rejectsAnUnverifiedGoogleEmail() {
        when(tokenVerifier.verify("google-id-token")).thenReturn(
                new VerifiedGoogleIdentity(ISSUER, SUBJECT, EMAIL, false, "Ada", "Lovelace", "Ada Lovelace"));

        assertThrows(BadRequestException.class, () -> service.authenticate("google-id-token"));
        verify(identityRepository, never()).findByIssuerAndSubject(anyString(), anyString());
    }

    @Test
    void rejectsGoogleIdentityLinkedToStaff() {
        Staff staff = new Staff();
        staff.setId(UUID.randomUUID());
        staff.setEmail(EMAIL);
        staff.setRole(Role.ADMIN);
        when(tokenVerifier.verify("google-id-token")).thenReturn(verifiedIdentity());
        when(identityRepository.findByIssuerAndSubject(ISSUER, SUBJECT))
                .thenReturn(Optional.of(linkedIdentity(staff)));

        assertThrows(ConflictException.class, () -> service.authenticate("google-id-token"));
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }

    @Test
    void rejectsArchivedMembersEvenWhenTheirGoogleIdentityWasPreviouslyLinked() {
        Member member = member();
        member.setArchived(true);
        when(tokenVerifier.verify("google-id-token")).thenReturn(verifiedIdentity());
        when(identityRepository.findByIssuerAndSubject(ISSUER, SUBJECT))
                .thenReturn(Optional.of(linkedIdentity(member)));

        assertThrows(ConflictException.class, () -> service.authenticate("google-id-token"));
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }

    @Test
    void linksGoogleOnlyAfterMemberAuthenticationAndDoesNotRequireEmailToMatch() {
        Member member = member();
        VerifiedGoogleIdentity otherEmailIdentity = new VerifiedGoogleIdentity(
                ISSUER, SUBJECT, "different@example.com", true, "Ada", "Lovelace", "Ada Lovelace");
        when(tokenVerifier.verify("google-id-token")).thenReturn(otherEmailIdentity);
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(member));
        when(identityRepository.findByIssuerAndSubject(ISSUER, SUBJECT)).thenReturn(Optional.empty());
        when(identityRepository.existsByUserId(member.getId())).thenReturn(false);

        service.link(EMAIL, "google-id-token");

        verify(identityRepository).saveAndFlush(any(GoogleIdentity.class));
    }

    @Test
    void refusesLinkingFromAStaffAccount() {
        Staff staff = new Staff();
        staff.setId(UUID.randomUUID());
        staff.setEmail("staff@example.com");
        staff.setRole(Role.ADMIN);
        when(tokenVerifier.verify("google-id-token")).thenReturn(verifiedIdentity());
        when(userRepository.findByEmailIgnoreCase("staff@example.com")).thenReturn(Optional.of(staff));

        assertThrows(AccessDeniedException.class, () -> service.link("staff@example.com", "google-id-token"));
        verify(identityRepository, never()).saveAndFlush(any(GoogleIdentity.class));
    }

    @Test
    void reportsGoogleLinkStatusForMembers() {
        Member member = member();
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(member));
        when(identityRepository.existsByUserId(member.getId())).thenReturn(true);

        assertTrue(service.isLinked(EMAIL));
    }

    @Test
    void reportsUnlinkedStatusForMembers() {
        Member member = member();
        when(userRepository.findByEmailIgnoreCase(EMAIL)).thenReturn(Optional.of(member));
        when(identityRepository.existsByUserId(member.getId())).thenReturn(false);

        assertFalse(service.isLinked(EMAIL));
    }

    private VerifiedGoogleIdentity verifiedIdentity() {
        return new VerifiedGoogleIdentity(ISSUER, SUBJECT, EMAIL, true, "Ada", "Lovelace", "Ada Lovelace");
    }

    private Member member() {
        Member member = new Member();
        member.setId(UUID.randomUUID());
        member.setNom("Lovelace");
        member.setPrenom("Ada");
        member.setEmail(EMAIL);
        member.setRole(Role.MEMBER);
        return member;
    }

    private GoogleIdentity linkedIdentity(com.example.gym_app.user.entity.User user) {
        GoogleIdentity identity = new GoogleIdentity();
        identity.setUser(user);
        identity.setIssuer(ISSUER);
        identity.setSubject(SUBJECT);
        return identity;
    }
}
