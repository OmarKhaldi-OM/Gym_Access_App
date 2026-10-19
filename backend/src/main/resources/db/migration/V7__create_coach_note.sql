CREATE TABLE coach_note (
    id BINARY(16) NOT NULL,
    coach_id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    contenu TEXT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_coach_note_coach FOREIGN KEY (coach_id) REFERENCES trainer (id),
    CONSTRAINT fk_coach_note_member FOREIGN KEY (member_id) REFERENCES member (id),
    INDEX idx_coach_note_owner_member_created (coach_id, member_id, created_at)
) ENGINE=InnoDB;
