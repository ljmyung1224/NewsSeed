create table if not exists public.user_learning_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  grade text check (grade in ('1-2', '3-4', '5-6')),
  interests text[] not null default '{}',
  xp integer not null default 0 check (xp >= 0),
  streak integer not null default 0 check (streak >= 0),
  last_completed_date date,
  completed_dates date[] not null default '{}',
  article_completions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_learning_state enable row level security;

create policy "Users can read their own learning state"
on public.user_learning_state for select
using (auth.uid() = user_id);

create policy "Users can insert their own learning state"
on public.user_learning_state for insert
with check (auth.uid() = user_id);

create policy "Users can update their own learning state"
on public.user_learning_state for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
