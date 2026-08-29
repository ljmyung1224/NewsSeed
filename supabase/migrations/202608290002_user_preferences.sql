alter table public.user_learning_state
  add column if not exists reading_level text not null default 'normal' check (reading_level in ('easy', 'normal', 'challenge')),
  add column if not exists explanation_level text not null default 'easy' check (explanation_level in ('very-easy', 'easy', 'detailed')),
  add column if not exists daily_article_count integer not null default 3 check (daily_article_count between 1 and 5),
  add column if not exists daily_delivery_time time;
