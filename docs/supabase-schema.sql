-- Run this in the Supabase SQL editor after creating a project.
-- This schema is intentionally authenticated-only. Do not restore an open
-- USING (true) policy: that would let anonymous players read/write save rows.
create table if not exists public.player_saves (
    player_id text primary key,
    save_state jsonb not null,
    updated_at timestamptz not null default now()
);

alter table public.player_saves enable row level security;

drop policy if exists "prototype player save access" on public.player_saves;
drop policy if exists "authenticated player save access" on public.player_saves;

create policy "authenticated player save access" on public.player_saves
    for all
    to authenticated
    using (player_id = auth.uid()::text)
    with check (player_id = auth.uid()::text);
