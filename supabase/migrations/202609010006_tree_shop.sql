alter table public.user_learning_state
  add column if not exists leaf_currency integer not null default 0 check (leaf_currency >= 0),
  add column if not exists leaf_reward_events jsonb not null default '{}'::jsonb,
  add column if not exists tree_item_purchases jsonb not null default '{}'::jsonb,
  add column if not exists owned_tree_items jsonb not null default '["pot-default","decor-none","background-default","friend-none"]'::jsonb,
  add column if not exists equipped_tree_items jsonb not null default '{"pot":"pot-default","decoration":"decor-none","background":"background-default","friend":"friend-none"}'::jsonb,
  add column if not exists tree_customization_unlock_seen boolean not null default false,
  add column if not exists tree_updated_at timestamptz;

comment on column public.user_learning_state.leaf_reward_events is
  'Idempotent learning reward ledger. Merge by event key; never add device balances.';

comment on column public.user_learning_state.tree_item_purchases is
  'Item purchase ledger keyed by item id, used to derive leaf balance safely.';
