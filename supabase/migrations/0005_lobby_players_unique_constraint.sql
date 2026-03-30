-- ============================================================
-- 0005_lobby_players_unique_constraint.sql
-- Adds unique constraint (lobby_id, user_id) for upsert support
-- ============================================================

ALTER TABLE public.lobby_players
  ADD CONSTRAINT lobby_players_lobby_user_unique UNIQUE (lobby_id, user_id);
