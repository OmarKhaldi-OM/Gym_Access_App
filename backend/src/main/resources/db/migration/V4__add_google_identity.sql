CREATE TABLE google_identity (
    user_id BINARY(16) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id),
    CONSTRAINT uq_google_identity_issuer_subject UNIQUE (issuer, subject),
    CONSTRAINT fk_google_identity_app_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB;
