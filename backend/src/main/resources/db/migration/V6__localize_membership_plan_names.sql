ALTER TABLE membership_plan
    ADD COLUMN nom_en VARCHAR(255) NULL,
    ADD COLUMN nom_ar VARCHAR(255) NULL;

UPDATE membership_plan
SET nom_en = CASE LOWER(TRIM(nom))
        WHEN 'abonnement mensuel' THEN 'Monthly membership'
        WHEN 'abonnement trimestriel' THEN 'Quarterly membership'
        WHEN 'abonnement semestriel' THEN 'Semi-annual membership'
        WHEN 'abonnement annuel' THEN 'Annual membership'
        ELSE nom_en
    END,
    nom_ar = CASE LOWER(TRIM(nom))
        WHEN 'abonnement mensuel' THEN 'اشتراك شهري'
        WHEN 'abonnement trimestriel' THEN 'اشتراك ربع سنوي'
        WHEN 'abonnement semestriel' THEN 'اشتراك نصف سنوي'
        WHEN 'abonnement annuel' THEN 'اشتراك سنوي'
        ELSE nom_ar
    END;
