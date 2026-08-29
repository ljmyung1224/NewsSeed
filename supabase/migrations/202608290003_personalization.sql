alter table public.user_learning_state
  add column if not exists custom_interests text[] not null default '{}',
  add column if not exists onboarding_completed boolean not null default false;

comment on column public.user_learning_state.custom_interests is
  'User-entered interests, normalized and limited by the application. Treat as untrusted input.';

create table if not exists public.kid_article_cache (
  cache_key text primary key,
  source_url text not null,
  grade_level text not null check (grade_level in ('1-2', '3-4', '5-6')),
  reading_level text not null check (reading_level in ('easy', 'normal', 'challenge')),
  explanation_level text not null check (explanation_level in ('very-easy', 'easy', 'detailed')),
  content jsonb not null,
  generated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.kid_article_cache enable row level security;
comment on table public.kid_article_cache is
  'Server-side cache prepared for a service-role adapter. No browser RLS policies are intentionally defined.';
