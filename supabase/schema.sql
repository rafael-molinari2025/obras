-- Run this once in the Supabase SQL Editor for this project.
-- Stores the construction-finance app data (obras/etapas/lançamentos) as one
-- JSON document per authenticated user, protected by row-level security.
-- `rev` is incremented on every write so concurrent devices can detect each
-- other's changes and merge instead of overwriting them.

create table if not exists public.obras_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  rev bigint not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.obras_data enable row level security;

create policy "select own row" on public.obras_data
  for select using (auth.uid() = user_id);

create policy "insert own row" on public.obras_data
  for insert with check (auth.uid() = user_id);

create policy "update own row" on public.obras_data
  for update using (auth.uid() = user_id);
