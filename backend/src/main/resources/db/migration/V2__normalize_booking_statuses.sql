UPDATE booking
SET statut = 'CONFIRMED'
WHERE UPPER(statut) = 'CONFIRMEE';

UPDATE booking
SET statut = 'CANCELLED'
WHERE UPPER(statut) = 'ANNULEE';
