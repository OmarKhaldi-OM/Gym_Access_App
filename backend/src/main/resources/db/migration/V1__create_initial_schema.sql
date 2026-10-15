CREATE TABLE app_user (
    id BINARY(16) NOT NULL,
    user_type VARCHAR(31) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telephone VARCHAR(255),
    bio VARCHAR(1000),
    profile_photo_filename VARCHAR(255),
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    date_creation DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_app_user_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE member (
    id BINARY(16) NOT NULL,
    date_naissance DATE,
    date_inscription DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_member_app_user FOREIGN KEY (id) REFERENCES app_user (id)
) ENGINE=InnoDB;

CREATE TABLE staff (
    id BINARY(16) NOT NULL,
    date_embauche DATE,
    PRIMARY KEY (id),
    CONSTRAINT fk_staff_app_user FOREIGN KEY (id) REFERENCES app_user (id)
) ENGINE=InnoDB;

CREATE TABLE trainer (
    id BINARY(16) NOT NULL,
    specialite VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_trainer_staff FOREIGN KEY (id) REFERENCES staff (id),
    INDEX idx_trainer_specialite (specialite)
) ENGINE=InnoDB;

CREATE TABLE membership_plan (
    id BINARY(16) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prix DECIMAL(38, 2) NOT NULL,
    duree_jours INT NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_membership_plan_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE gym_class (
    id BINARY(16) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    capacite_max INT NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_gym_class_nom (nom)
) ENGINE=InnoDB;

CREATE TABLE face_authentication (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    vecteur_facial LONGBLOB NOT NULL,
    date_enregistrement DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_face_authentication_user UNIQUE (user_id),
    CONSTRAINT fk_face_authentication_user FOREIGN KEY (user_id) REFERENCES app_user (id)
) ENGINE=InnoDB;

CREATE TABLE class_schedule (
    id BINARY(16) NOT NULL,
    class_id BINARY(16) NOT NULL,
    trainer_id BINARY(16) NOT NULL,
    date_heure DATETIME(6) NOT NULL,
    duree_min INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_class_schedule_class FOREIGN KEY (class_id) REFERENCES gym_class (id),
    CONSTRAINT fk_class_schedule_trainer FOREIGN KEY (trainer_id) REFERENCES trainer (id),
    INDEX idx_class_schedule_class (class_id),
    INDEX idx_class_schedule_trainer_date (trainer_id, date_heure),
    INDEX idx_class_schedule_date (date_heure)
) ENGINE=InnoDB;

CREATE TABLE subscription (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    plan_id BINARY(16) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_subscription_member FOREIGN KEY (member_id) REFERENCES member (id),
    CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_id) REFERENCES membership_plan (id),
    INDEX idx_subscription_member (member_id),
    INDEX idx_subscription_plan (plan_id),
    INDEX idx_subscription_status_end (statut, date_fin)
) ENGINE=InnoDB;

CREATE TABLE booking (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    schedule_id BINARY(16) NOT NULL,
    date_reservation DATETIME(6) NOT NULL,
    statut VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_booking_member FOREIGN KEY (member_id) REFERENCES member (id),
    CONSTRAINT fk_booking_schedule FOREIGN KEY (schedule_id) REFERENCES class_schedule (id),
    INDEX idx_booking_member (member_id),
    INDEX idx_booking_schedule (schedule_id)
) ENGINE=InnoDB;

CREATE TABLE trainer_booking (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    trainer_id BINARY(16) NOT NULL,
    date_heure DATETIME(6) NOT NULL,
    statut VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_trainer_booking_member FOREIGN KEY (member_id) REFERENCES member (id),
    CONSTRAINT fk_trainer_booking_trainer FOREIGN KEY (trainer_id) REFERENCES trainer (id),
    INDEX idx_trainer_booking_member (member_id),
    INDEX idx_trainer_booking_trainer (trainer_id)
) ENGINE=InnoDB;

CREATE TABLE coaching_request (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    trainer_id BINARY(16) NOT NULL,
    requested_at DATETIME(6) NOT NULL,
    goal VARCHAR(1000) NOT NULL,
    status VARCHAR(255) NOT NULL,
    response VARCHAR(1000),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_coaching_request_member FOREIGN KEY (member_id) REFERENCES member (id),
    CONSTRAINT fk_coaching_request_trainer FOREIGN KEY (trainer_id) REFERENCES trainer (id),
    INDEX idx_coaching_request_member_created (member_id, created_at),
    INDEX idx_coaching_request_trainer_created (trainer_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE member_goal (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    name VARCHAR(180) NOT NULL,
    target INT NOT NULL,
    `current` INT NOT NULL,
    deadline DATE,
    status VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_member_goal_member FOREIGN KEY (member_id) REFERENCES member (id),
    INDEX idx_member_goal_member_deadline (member_id, deadline)
) ENGINE=InnoDB;

CREATE TABLE progress_log (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    date_mesure DATE NOT NULL,
    poids FLOAT,
    masse_grasse FLOAT,
    notes TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_progress_log_member FOREIGN KEY (member_id) REFERENCES member (id),
    INDEX idx_progress_log_member_date (member_id, date_mesure)
) ENGINE=InnoDB;

CREATE TABLE face_embedding (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    vecteur_facial LONGBLOB NOT NULL,
    date_enregistrement DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_face_embedding_member FOREIGN KEY (member_id) REFERENCES member (id),
    INDEX idx_face_embedding_member (member_id)
) ENGINE=InnoDB;

CREATE TABLE access_log (
    id BINARY(16) NOT NULL,
    member_id BINARY(16) NOT NULL,
    staff_id BINARY(16),
    horodatage DATETIME(6) NOT NULL,
    resultat VARCHAR(255) NOT NULL,
    score_confiance FLOAT,
    type_acces VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_access_log_member FOREIGN KEY (member_id) REFERENCES member (id),
    CONSTRAINT fk_access_log_staff FOREIGN KEY (staff_id) REFERENCES staff (id),
    INDEX idx_access_log_member_type (member_id, type_acces),
    INDEX idx_access_log_resultat (resultat),
    INDEX idx_access_log_staff (staff_id),
    INDEX idx_access_log_timestamp (horodatage)
) ENGINE=InnoDB;
