-- Mstrmnd Phase 1 initial schema
-- Auth + DB + RLS on Supabase

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  onboarding_completed boolean not null default false,
  onboarding_started_at timestamptz,
  onboarding_completed_at timestamptz,
  subscription_tier text check (subscription_tier in ('solo', 'pro', 'mastermind')),
  stripe_customer_id text,
  stripe_subscription_id text,
  identity jsonb not null default '{}'::jsonb,
  goals jsonb not null default '{}'::jsonb,
  signal_preferences jsonb not null default '{}'::jsonb,
  style_preferences jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  memory_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_subscription_tier_idx on public.profiles (subscription_tier);
create index profiles_stripe_customer_id_idx on public.profiles (stripe_customer_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, onboarding_started_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    now()
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('onboarding', 'signal', 'agent', 'support')),
  title text,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  eve_session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index conversations_user_id_idx on public.conversations (user_id);
create index conversations_type_status_idx on public.conversations (type, status);

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text,
  tool_calls jsonb,
  tool_results jsonb,
  input_tokens integer,
  output_tokens integer,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id);
create index messages_user_id_idx on public.messages (user_id);
create index messages_created_at_idx on public.messages (created_at);

-- ---------------------------------------------------------------------------
-- signal_reports
-- ---------------------------------------------------------------------------
create table public.signal_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  title text,
  summary text,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'generating', 'ready', 'failed')),
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  constraint signal_reports_period_check check (period_end >= period_start)
);

create index signal_reports_user_id_idx on public.signal_reports (user_id);
create index signal_reports_period_idx on public.signal_reports (user_id, period_type, period_start);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.signal_reports enable row level security;

-- profiles: users own their row (id = auth.uid())
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- conversations
create policy "conversations_select_own"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "conversations_insert_own"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "conversations_update_own"
  on public.conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- messages
create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "messages_update_own"
  on public.messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- signal_reports
create policy "signal_reports_select_own"
  on public.signal_reports for select
  using (auth.uid() = user_id);

create policy "signal_reports_insert_own"
  on public.signal_reports for insert
  with check (auth.uid() = user_id);

create policy "signal_reports_update_own"
  on public.signal_reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role bypasses RLS by default (used by the eve agent for profile writes).
comment on table public.profiles is 'User-owned intelligence profile. Eve agent writes via service role; clients use RLS.';
comment on table public.conversations is 'Chat threads including onboarding sessions keyed to eve_session_id.';
comment on table public.messages is 'Conversation messages with optional tool call/result payloads.';
comment on table public.signal_reports is 'Weekly/monthly signal reports generated from the seeded profile.';
