package com.example.gym_app.user.service;

import com.example.gym_app.access.entity.Access_Log;
import com.example.gym_app.access.entity.Face_Authentication;
import com.example.gym_app.access.repository.FaceAuthenticationRepository;
import com.example.gym_app.access.repository.FaceEmbeddingRepository;
import com.example.gym_app.membership.entity.Subscription;
import com.example.gym_app.membership.repository.SubscriptionRepository;
import com.example.gym_app.security.ProfilePhotoStorageService;
import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private SecurityUtil securityUtil;
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private FaceEmbeddingRepository faceEmbeddingRepository;
    @Mock
    private FaceAuthenticationRepository faceAuthenticationRepository;
    @Mock
    private ProfilePhotoStorageService profilePhotoStorageService;

    private MemberService memberService;

    @BeforeEach
    void setUp() {
        memberService = new MemberService(
                memberRepository,
                passwordEncoder,
                securityUtil,
                subscriptionRepository,
                faceEmbeddingRepository,
                faceAuthenticationRepository,
                profilePhotoStorageService);
    }

    @Test
    void anonymizesMemberAndPreservesAccessLogsWhenDeleting() {
        UUID memberId = UUID.randomUUID();
        Member member = new Member();
        member.setId(memberId);
        member.setNom("Ben Ali");
        member.setPrenom("Sara");
        member.setEmail("sara@example.com");
        member.setTelephone("12345678");
        member.setBio("Member bio");
        member.setProfilePhotoFilename("profile.jpg");
        member.setDateNaissance(java.time.LocalDate.of(1990, 1, 1));
        Access_Log accessLog = new Access_Log();
        member.setAccessLogs(List.of(accessLog));

        Subscription activeSubscription = new Subscription();
        activeSubscription.setStatut("ACTIVE");
        Subscription expiredSubscription = new Subscription();
        expiredSubscription.setStatut("EXPIRED");
        Face_Authentication faceAuthentication = new Face_Authentication();

        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));
        when(subscriptionRepository.findByMemberId(memberId))
                .thenReturn(List.of(activeSubscription, expiredSubscription));
        when(faceAuthenticationRepository.findByUserId(memberId)).thenReturn(Optional.of(faceAuthentication));
        when(passwordEncoder.encode(anyString())).thenReturn("unusable-password-hash");

        memberService.delete(memberId);

        assertTrue(member.isArchived());
        assertEquals("Membre anonymisé", member.getNom());
        assertEquals("", member.getPrenom());
        assertEquals("deleted+" + memberId + "@invalid.local", member.getEmail());
        assertNull(member.getTelephone());
        assertNull(member.getBio());
        assertNull(member.getProfilePhotoFilename());
        assertNull(member.getDateNaissance());
        assertEquals("CANCELLED", activeSubscription.getStatut());
        assertEquals("EXPIRED", expiredSubscription.getStatut());
        assertEquals(List.of(accessLog), member.getAccessLogs());

        verify(memberRepository).save(member);
        verify(memberRepository, never()).deleteById(memberId);
        verify(subscriptionRepository).saveAll(List.of(activeSubscription, expiredSubscription));
        verify(faceEmbeddingRepository).deleteAllByMemberId(memberId);
        verify(faceAuthenticationRepository).delete(faceAuthentication);
        verify(profilePhotoStorageService).delete("profile.jpg");
    }

    @Test
    void memberListExcludesArchivedProfiles() {
        when(memberRepository.findByArchivedFalse()).thenReturn(List.of(new Member()));

        assertEquals(1, memberService.findAll().size());

        verify(memberRepository).findByArchivedFalse();
    }

    @Test
    void archivedProfileIsNotAccessibleById() {
        UUID memberId = UUID.randomUUID();
        Member member = new Member();
        member.setArchived(true);
        when(memberRepository.findById(memberId)).thenReturn(Optional.of(member));

        assertThrows(
                com.example.gym_app.exception.ResourceNotFoundException.class,
                () -> memberService.findById(memberId));
        assertTrue(member.isArchived());
    }
}
