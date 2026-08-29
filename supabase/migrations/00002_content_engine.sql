-- MSTRMND Content Engine v2 — CANVAS persistence
-- Source: CONTENT-ENGINE-v2.md. Do not invent a second jobs table.
-- CIPHER / HERALD / AXIOM tables exist so later slices attach; this slice
-- only writes ce_jobs + ce_items.

create table public.ce_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null default 'manual'
    check (source in ('manual', 'calendar', 'trigger')),
  touchpoint text not null default 'brand'
    check (touchpoint in (
      'discovery', 'conversion', 'onboarding', 'delivery', 'retention', 'brand'
    )),
  template text not null
    check (template in (
      'press_card', 'linkedin', 'x_thread', 'email', 'site', 'proposal', 'report', 'visual_spec'
    )),
  voice text not null check (voice in ('labs', 'operator')),
  thesis text not null,
  scout_packet jsonb not null default '{}'::jsonb,
  formats text[] not null default array['press_card', 'linkedin']::text[],
  status text not null default 'queued'
    check (status in (
      'queued', 'research', 'drafting', 'gating',
      'awaiting_approval', 'published', 'killed'
    )),
  priority int not null default 3
);

create index ce_jobs_user_id_idx on public.ce_jobs (user_id);
create index ce_jobs_status_idx on public.ce_jobs (status);

create trigger ce_jobs_set_updated_at
  before update on public.ce_jobs
  for each row execute function public.set_updated_at();

create table public.ce_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.ce_jobs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  format text not null,
  draft_cycle int not null default 1,
  body text,
  content_ref text,
  model_used text,
  cost_usd numeric(8, 4),
  status text not null default 'drafted'
    check (status in ('drafted', 'indexed', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index ce_items_job_id_idx on public.ce_items (job_id);
create index ce_items_user_id_idx on public.ce_items (user_id);

-- Present for CIPHER / HERALD / AXIOM. This slice does not write them.
create table public.ce_gates (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.ce_items (id) on delete cascade,
  score int not null,
  voice_ok boolean not null,
  facts_ok boolean not null,
  verdict text not null check (verdict in ('pass', 'revise', 'reject', 'escalate')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.ce_publications (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.ce_items (id) on delete cascade,
  channel text not null,
  published_at timestamptz,
  url text,
  approved_by text
);

create table public.ce_metrics_daily (
  day date not null,
  channel text not null,
  impressions int,
  engagements int,
  clicks int,
  leads int,
  audit_sales int,
  primary key (day, channel)
);

alter table public.ce_jobs enable row level security;
alter table public.ce_items enable row level security;
alter table public.ce_gates enable row level security;
alter table public.ce_publications enable row level security;
alter table public.ce_metrics_daily enable row level security;

create policy "ce_jobs_select_own"
  on public.ce_jobs for select using (auth.uid() = user_id);
create policy "ce_jobs_insert_own"
  on public.ce_jobs for insert with check (auth.uid() = user_id);
create policy "ce_jobs_update_own"
  on public.ce_jobs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ce_items_select_own"
  on public.ce_items for select using (auth.uid() = user_id);
create policy "ce_items_insert_own"
  on public.ce_items for insert with check (auth.uid() = user_id);
create policy "ce_items_update_own"
  on public.ce_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Gates / publications are attached to items the user owns.
create policy "ce_gates_select_own"
  on public.ce_gates for select
  using (
    exists (
      select 1 from public.ce_items i
      where i.id = item_id and i.user_id = auth.uid()
    )
  );

create policy "ce_publications_select_own"
  on public.ce_publications for select
  using (
    exists (
      select 1 from public.ce_items i
      where i.id = item_id and i.user_id = auth.uid()
    )
  );

-- Daily metrics are operator-wide; readable by any authenticated user, writes via service role.
create policy "ce_metrics_daily_select_auth"
  on public.ce_metrics_daily for select
  using (auth.uid() is not null);

comment on table public.ce_jobs is 'Content Engine jobs. CANVAS writes via eve service role; clients use RLS.';
comment on table public.ce_items is 'CANVAS multi-format drafts for a ce_jobs row.';
comment on table public.ce_gates is 'CIPHER scores. Schema only in this slice — no writer yet.';
comment on table public.ce_publications is 'HERALD publications. Schema only in this slice — no writer yet.';
comment on table public.ce_metrics_daily is 'AXIOM daily rollup. Schema only in this slice — no writer yet.';
