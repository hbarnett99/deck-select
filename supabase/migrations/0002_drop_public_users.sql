-- Drop the public.users table and its associated function.
-- Discord profile data is read from auth.users.raw_user_meta_data via service role instead.

drop function if exists public.upsert_user(text, text, text);
drop table if exists public.users;
