-- Harden CANVAS persistence after the initial Content Engine migration.
-- Keep this additive so databases that already applied 00002 receive the fixes.

alter table public.ce_jobs
  add constraint ce_jobs_formats_supported
  check (
    cardinality(formats) > 0
    and formats <@ array[
      'press_card', 'linkedin', 'x_thread', 'email',
      'site', 'proposal', 'report', 'visual_spec'
    ]::text[]
  );

alter table public.ce_items
  add constraint ce_items_format_supported
  check (format in (
    'press_card', 'linkedin', 'x_thread', 'email',
    'site', 'proposal', 'report', 'visual_spec'
  ));

-- A ce_items row and its parent job must belong to the same authenticated user.
drop policy if exists "ce_items_insert_own" on public.ce_items;
create policy "ce_items_insert_own"
  on public.ce_items for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.ce_jobs j
      where j.id = ce_items.job_id
        and j.user_id = auth.uid()
    )
  );

drop policy if exists "ce_items_update_own" on public.ce_items;
create policy "ce_items_update_own"
  on public.ce_items for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.ce_jobs j
      where j.id = ce_items.job_id
        and j.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.ce_jobs j
      where j.id = ce_items.job_id
        and j.user_id = auth.uid()
    )
  );

-- AXIOM has no writer or tenant key yet. Remove broad client reads until it does.
drop policy if exists "ce_metrics_daily_select_auth" on public.ce_metrics_daily;

comment on table public.ce_metrics_daily is
  'AXIOM daily rollup. Service-role only until a tenant ownership key and scoped RLS are added.';
