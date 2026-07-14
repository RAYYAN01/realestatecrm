-- ============================================================================
-- Naaz AI CRM — database schema for Supabase (Postgres)
-- Run this in the Supabase Dashboard → SQL Editor → New query → Run.
-- Every row is owned by the authenticated user (user_id) and protected by RLS.
-- ============================================================================

-- Leads --------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  phone         text,
  email         text,
  location      text,
  budget_min    bigint default 0,
  budget_max    bigint default 0,
  property_type text,
  purpose       text,               -- Buy | Rent | Invest
  source        text,
  agent         text,
  priority      text,               -- Low | Medium | High
  status        text default 'New', -- New | Contacted | Interested | Qualified | Negotiation | Won | Lost
  bedrooms      int default 0,
  bathrooms     int default 0,
  area_required text,
  possession    text,
  facing        text,
  parking       int default 0,
  amenities     text[] default '{}',
  won_details   jsonb,
  lost_reason   text,
  favorite      boolean default false,
  last_contact  timestamptz default now(),
  created_at    timestamptz default now()
);

-- Prospects ----------------------------------------------------------------
create table if not exists public.prospects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  phone          text,
  email          text,
  location       text,
  budget         bigint default 0,
  interest_level text default 'Medium',
  notes          text,
  created_at     timestamptz default now()
);

-- Clients ------------------------------------------------------------------
create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null,
  phone        text,
  email        text,
  location     text,
  properties   int default 0,
  total_value  bigint default 0,
  since        timestamptz default now(),
  created_at   timestamptz default now()
);

-- Tasks --------------------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  lead_id      uuid references public.leads (id) on delete set null,
  title        text not null,
  description  text,
  assigned_to  text,
  priority     text default 'Medium',
  status       text default 'To Do', -- To Do | In Progress | Done
  due_date     timestamptz,
  created_at   timestamptz default now()
);

-- Meetings -----------------------------------------------------------------
create table if not exists public.meetings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  lead_id      uuid references public.leads (id) on delete set null,
  title        text not null,
  lead_name    text,
  date         timestamptz,
  time         text,
  location     text,
  participants text[] default '{}',
  status       text default 'Scheduled', -- Scheduled | Completed | Cancelled
  created_at   timestamptz default now()
);

-- Calls --------------------------------------------------------------------
create table if not exists public.calls (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  lead_id    uuid references public.leads (id) on delete set null,
  lead_name  text,
  direction  text,   -- Incoming | Outgoing
  duration   text,
  agent      text,
  summary    text,
  follow_up  boolean default false,
  created_at timestamptz default now()
);

-- Lead notes / timeline / documents ---------------------------------------
create table if not exists public.lead_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  lead_id    uuid not null references public.leads (id) on delete cascade,
  author     text,
  content    text not null,
  pinned     boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.lead_timeline (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  lead_id     uuid not null references public.leads (id) on delete cascade,
  type        text,
  title       text,
  description text,
  author      text,
  created_at  timestamptz default now()
);

create table if not exists public.lead_documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  lead_id     uuid not null references public.leads (id) on delete cascade,
  name        text not null,
  type        text,
  size        text,
  storage_path text,
  created_at  timestamptz default now()
);

-- Team members -------------------------------------------------------------
create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  email      text,
  role       text default 'Agent',  -- Admin | Manager | Agent
  status     text default 'Invited',
  created_at timestamptz default now()
);

-- Audit log ----------------------------------------------------------------
create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  action     text not null,
  target     text,
  actor      text,
  category   text,
  created_at timestamptz default now()
);

-- Helpful indexes ----------------------------------------------------------
create index if not exists idx_leads_user       on public.leads (user_id);
create index if not exists idx_tasks_lead        on public.tasks (lead_id);
create index if not exists idx_meetings_lead     on public.meetings (lead_id);
create index if not exists idx_calls_lead        on public.calls (lead_id);
create index if not exists idx_notes_lead        on public.lead_notes (lead_id);
create index if not exists idx_timeline_lead     on public.lead_timeline (lead_id);
create index if not exists idx_documents_lead    on public.lead_documents (lead_id);

-- ============================================================================
-- Per-user application state (flexible key/value snapshots).
-- Each store (leads, activities, prospects, audit-log) persists its whole
-- JSON snapshot under one key per user. This lets the CRM sync across devices
-- while the client keeps working offline from localStorage. RLS-protected.
-- ============================================================================
create table if not exists public.crm_state (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.crm_state enable row level security;
drop policy if exists "owner_all" on public.crm_state;
create policy "owner_all" on public.crm_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- Row-Level Security: users can only touch their own rows.
-- ============================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'leads','prospects','clients','tasks','meetings','calls',
    'lead_notes','lead_timeline','lead_documents','team_members','audit_log'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($f$
      drop policy if exists "owner_all" on public.%1$I;
      create policy "owner_all" on public.%1$I
        for all
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;

-- ============================================================================
-- Team access control ("admin world"): admin-managed invite allowlist.
-- ONLY emails present here may sign up. Admins manage the list from the CRM.
-- Admins themselves are seeded below (keep in sync with NEXT_PUBLIC_ADMIN_EMAILS)
-- so admin creation stays a deploy-time action, not a runtime one.
-- ============================================================================
create table if not exists public.app_members (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  full_name  text,
  role       text not null default 'employee',  -- 'admin' | 'employee'
  status     text not null default 'invited',   -- 'invited' | 'active' | 'disabled'
  invited_by text,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER helpers run as the owner, so they bypass RLS. This lets us
-- (a) check "am I an admin?" without a recursive policy on app_members, and
-- (b) check "is this email invited?" before the user is even authenticated.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.app_members
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role = 'admin'
      and status <> 'disabled'
  );
$$;

create or replace function public.is_email_allowed(p_email text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.app_members
    where lower(email) = lower(coalesce(p_email, ''))
      and status <> 'disabled'
  );
$$;

-- A freshly signed-in user flips their own invite from 'invited' to 'active'.
create or replace function public.mark_self_active()
returns void
language sql volatile security definer set search_path = public as $$
  update public.app_members
     set status = 'active'
   where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
     and status = 'invited';
$$;

grant execute on function public.is_email_allowed(text) to anon, authenticated;
grant execute on function public.is_admin()              to authenticated;
grant execute on function public.mark_self_active()      to authenticated;

alter table public.app_members enable row level security;

-- Admins read/manage everyone; a non-admin may read only their own row.
drop policy if exists "members_read" on public.app_members;
create policy "members_read" on public.app_members
  for select
  using (
    public.is_admin()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "members_admin_write" on public.app_members;
create policy "members_admin_write" on public.app_members
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Bootstrap the founding admins so they can sign in and manage the team.
insert into public.app_members (email, full_name, role, status) values
  ('mohammedrayan@naazailabs.com', 'Mohammed Rayan', 'admin', 'active'),
  ('admin@naazailabs.com',         'Administrator',  'admin', 'active')
on conflict (email) do update set role = 'admin', status = 'active';
