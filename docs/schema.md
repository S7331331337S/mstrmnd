# Schema

Source of truth: `supabase/migrations/00001_initial_schema.sql` and `supabase/migrations/00002_content_engine.sql`.

## Tables

### `profiles`
- PK `id` → `auth.users(id)` on delete cascade
- Identity fields: `full_name`, `avatar_url`, `email`
- Onboarding: `onboarding_completed`, `onboarding_started_at`, `onboarding_completed_at`
- Billing: `subscription_tier` (`solo`|`pro`|`mastermind`), Stripe ids
- Intelligence JSONB: `identity`, `goals`, `signal_preferences`, `style_preferences`, `context`
- `memory_summary` text
- Timestamps: `created_at`, `updated_at`

Triggers:
- `handle_new_user` — insert profile on `auth.users` insert
- `set_updated_at` — bump `updated_at` on update

### `conversations`
- `type`: `onboarding` | `signal` | `agent` | `support`
- `status`: `active` | `completed` | `abandoned`
- `eve_session_id` for linking to the eve runtime session
- `metadata` jsonb

### `messages`
- `role`: `user` | `assistant` | `system` | `tool`
- Optional `tool_calls` / `tool_results` jsonb
- Token counters for later cost telemetry

### `signal_reports`
- `period_type`: `weekly` | `monthly`
- `status`: `pending` | `generating` | `ready` | `failed`
- `content` jsonb payload for rendered report sections:
  - `highlights`, `watchlist`, `decisions`, optional `risks` / `sources`
- Written by the signal-report eve agent (service role); users SELECT/INSERT/UPDATE own via RLS

### `ce_jobs`
- Content Engine jobs. DESK-shaped: `source`, `touchpoint`, `template`, `voice` (`labs`|`operator`), `thesis`, `scout_packet` jsonb, `formats` text[]
- `status`: `queued` | `research` | `drafting` | `gating` | `awaiting_approval` | `published` | `killed`
- Owned by `user_id` → `profiles.id`
- Written by the canvas eve agent (service role)

### `ce_items`
- One draft per format for a job (`press_card`, `linkedin`, `visual_spec`, …)
- `body` holds the draft; `content_ref` is `ce_items/{id}`
- `status`: `drafted` | `indexed` | `rejected`
- CANVAS indexes after draft; CIPHER / HERALD tables exist but have no writers in this slice

### `ce_gates` / `ce_publications` / `ce_metrics_daily`
- Schema only. CIPHER, HERALD, and AXIOM are deferred. Do not invent a second jobs table.

## RLS

Core tables have RLS enabled.

| Table | Ownership key | Policies |
|---|---|---|
| `profiles` | `id = auth.uid()` | SELECT / INSERT / UPDATE own |
| `conversations` | `user_id = auth.uid()` | SELECT / INSERT / UPDATE own |
| `messages` | `user_id = auth.uid()` | SELECT / INSERT / UPDATE own |
| `signal_reports` | `user_id = auth.uid()` | SELECT / INSERT / UPDATE own |
| `ce_jobs` | `user_id = auth.uid()` | SELECT / INSERT / UPDATE own |
| `ce_items` | `user_id = auth.uid()` | SELECT / INSERT / UPDATE own |

Eve agents use the **service role** key for profile merges (onboarding), signal report writes, and CANVAS `ce_jobs` / `ce_items` writes. Service role bypasses RLS by design.

## Example profile JSON

```json
{
  "identity": {
    "role": "Founder / CEO",
    "company": "Northline",
    "stage": "seed",
    "location": "Los Angeles",
    "primary_domains": ["B2B SaaS", "ops automation"]
  },
  "goals": {
    "personal": ["Protect deep work mornings"],
    "business": ["Close 8 design partners", "Ship intelligence layer MVP"]
  },
  "signal_preferences": {
    "topics": ["agent infra", "AI distribution", "vertical SaaS"],
    "cadence": "weekly",
    "depth": "operator-grade"
  },
  "style_preferences": {
    "tone": "direct",
    "format": "bullets + decisions"
  },
  "context": {
    "tools": ["Cursor", "Supabase", "Vercel", "Stripe"],
    "constraints": ["Solo operator bandwidth"],
    "notes": "Prefer systems over one-off automations"
  },
  "memory_summary": "Founder of Northline building an intelligence layer; weekly operator-grade signals on agent infra and distribution."
}
```
