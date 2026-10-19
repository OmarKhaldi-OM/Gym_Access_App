UPDATE trainer_booking tb
JOIN member m ON m.id = tb.member_id
SET tb.statut = 'CANCELLED'
WHERE m.archived = TRUE
  AND tb.date_heure > CURRENT_TIMESTAMP(6)
  AND UPPER(tb.statut) <> 'CANCELLED';

UPDATE booking b
JOIN member m ON m.id = b.member_id
JOIN class_schedule cs ON cs.id = b.schedule_id
SET b.statut = 'CANCELLED'
WHERE m.archived = TRUE
  AND cs.date_heure > CURRENT_TIMESTAMP(6)
  AND UPPER(b.statut) <> 'CANCELLED';

UPDATE coaching_request cr
JOIN member m ON m.id = cr.member_id
SET cr.status = 'CANCELLED',
    cr.updated_at = CURRENT_TIMESTAMP(6)
WHERE m.archived = TRUE
  AND UPPER(cr.status) = 'PENDING';
