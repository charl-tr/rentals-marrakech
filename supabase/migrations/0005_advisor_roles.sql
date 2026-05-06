-- ════════════════════════════════════════════════════════════════════
-- 0005_advisor_roles.sql — rôles système + périmètre
-- ════════════════════════════════════════════════════════════════════
-- Nouvelle colonne `access_role` (on ne touche PAS à `role` qui stocke
-- déjà le libellé humain du conseiller — "Conseillère senior — Médina…").
--
-- Valeurs autorisées (validation côté app) :
--   - director : voit tout, gère l'équipe, réassigne
--   - advisor  : voit ses leads, mute ses leads
--
-- Setup démo : Camille = directrice.
-- ════════════════════════════════════════════════════════════════════

alter table advisors
  add column if not exists access_role text not null default 'advisor';

-- Set Camille en director pour la démo
update advisors set access_role = 'director' where slug = 'camille-decourt';

-- ── SI TU AS DÉJÀ JOUÉ LA V1 QUI ÉCRASAIT role ──────────────────────
-- Restaure le libellé de Camille (sinon elle apparaîtrait "director" au
-- lieu de "Conseillère senior — Médina & Riads"). Idempotent.
update advisors
   set role = 'Conseillère senior — Médina & Riads'
 where slug = 'camille-decourt' and role = 'director';
