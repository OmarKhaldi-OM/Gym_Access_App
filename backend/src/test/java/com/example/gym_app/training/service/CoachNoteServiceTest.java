package com.example.gym_app.training.service;

import com.example.gym_app.security.SecurityUtil;
import com.example.gym_app.training.dto.CoachNoteRequestDTO;
import com.example.gym_app.training.entity.CoachNote;
import com.example.gym_app.training.repository.CoachNoteRepository;
import com.example.gym_app.user.entity.Member;
import com.example.gym_app.user.entity.Role;
import com.example.gym_app.user.entity.Trainer;
import com.example.gym_app.user.repository.MemberRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CoachNoteServiceTest {
    @Mock
    private CoachNoteRepository coachNoteRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private CoachClientAccessService coachClientAccessService;

    private final SecurityUtil securityUtil = new SecurityUtil();
    private CoachNoteService coachNoteService;
    private Trainer currentCoach;
    private UUID noteId;
    private CoachNote note;

    @BeforeEach
    void setUp() {
        coachNoteService = new CoachNoteService(
                coachNoteRepository, memberRepository, coachClientAccessService, securityUtil);
        currentCoach = trainer("coach@example.com");
        noteId = UUID.randomUUID();
        note = new CoachNote();
        note.setId(noteId);
        note.setCoach(currentCoach);
        note.setMember(new Member());
        note.getMember().setId(UUID.randomUUID());
        note.setContenu("Initial note");
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        currentCoach.getEmail(), null,
                        List.of(new SimpleGrantedAuthority(Role.TRAINER.authority()))));
        when(coachClientAccessService.requireCurrentCoach()).thenReturn(currentCoach);
        when(coachNoteRepository.findById(noteId)).thenReturn(Optional.of(note));
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void coachCanUpdateTheirOwnNote() {
        when(coachNoteRepository.save(note)).thenReturn(note);
        CoachNoteRequestDTO request = new CoachNoteRequestDTO();
        request.setContenu("Updated note");

        assertEquals("Updated note", coachNoteService.update(noteId, request).getContenu());
        verify(coachNoteRepository).save(note);
    }

    @Test
    void coachCannotUpdateOrDeleteAnotherCoachsNote() {
        note.setCoach(trainer("another-coach@example.com"));

        assertThrows(AccessDeniedException.class, () -> coachNoteService.update(noteId, request("Changed")));
        assertThrows(AccessDeniedException.class, () -> coachNoteService.delete(noteId));
        verify(coachNoteRepository, never()).save(note);
        verify(coachNoteRepository, never()).delete(note);
    }

    private CoachNoteRequestDTO request(String contenu) {
        CoachNoteRequestDTO request = new CoachNoteRequestDTO();
        request.setContenu(contenu);
        return request;
    }

    private Trainer trainer(String email) {
        Trainer trainer = new Trainer();
        trainer.setId(UUID.randomUUID());
        trainer.setEmail(email);
        return trainer;
    }
}
