alter table public.user_learning_state
add column if not exists mission_rewards jsonb not null default '{}'::jsonb;
