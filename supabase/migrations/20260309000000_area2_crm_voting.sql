-- AREA 2: CRM & VOTING SCHEMA EXTENSIONS
create extension if not exists pgcrypto;


-- 1. Member Notes (Complaints, Incidents, General Notes, Volunteering)
create type note_type_enum as enum ('complaint', 'incident', 'note', 'volunteering');

create table public.member_notes (
  id uuid default gen_random_uuid() primary key,
  membership_id uuid references public.memberships(id) on delete cascade not null,
  admin_id uuid references public.profiles(id) on delete set null,
  type note_type_enum default 'note'::note_type_enum not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Elections
create table public.elections (
  id uuid default gen_random_uuid() primary key,
  year integer not null,
  title text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  is_active boolean default false not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Election Candidates
create table public.election_candidates (
  id uuid default gen_random_uuid() primary key,
  election_id uuid references public.elections(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Votes
create type vote_method_enum as enum ('electronic', 'postal');

create table public.votes (
  id uuid default gen_random_uuid() primary key,
  election_id uuid references public.elections(id) on delete cascade not null,
  membership_id uuid references public.memberships(id) on delete cascade not null,
  candidate_id uuid references public.election_candidates(id) on delete cascade not null,
  method vote_method_enum default 'electronic'::vote_method_enum not null,
  recorded_by uuid references public.profiles(id) on delete set null, -- For postal votes
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (election_id, membership_id) -- Ensures 1 vote per member per election
);

-- 5. Annual Audits
create type audit_status_enum as enum ('pending', 'completed');

create table public.annual_audits (
  id uuid default gen_random_uuid() primary key,
  membership_id uuid references public.memberships(id) on delete cascade not null,
  token text unique default encode(extensions.gen_random_bytes(32), 'hex') not null, -- For magic link access
  year integer not null,
  status audit_status_enum default 'pending'::audit_status_enum not null,
  requested_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------------------------------
alter table public.member_notes enable row level security;
alter table public.elections enable row level security;
alter table public.election_candidates enable row level security;
alter table public.votes enable row level security;
alter table public.annual_audits enable row level security;

-- Member Notes Policies (Admins only)
create policy "Admins can view all member notes."
  on public.member_notes for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert member notes."
  on public.member_notes for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete member notes."
  on public.member_notes for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Elections Policies
create policy "Everyone can view active elections."
  on public.elections for select using (is_active = true);

create policy "Admins can view all elections."
  on public.elections for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert and update elections."
  on public.elections for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Election Candidates Policies
create policy "Everyone can view candidates for active elections."
  on public.election_candidates for select using (
    exists (select 1 from public.elections where id = election_id and is_active = true)
  );

create policy "Admins can view all candidates."
  on public.election_candidates for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage candidates."
  on public.election_candidates for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Votes Policies
create policy "Users can view own votes."
  on public.votes for select using (
    exists (select 1 from public.memberships where id = membership_id and user_id = auth.uid())
  );

create policy "Admins can view all votes."
  on public.votes for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Note: The insert policy for votes is tricky. We must ensure only 'active' (paid) members can vote.
create policy "Active members can cast electronic votes."
  on public.votes for insert with check (
    method = 'electronic' and
    exists (
        -- User owns the membership
        select 1 from public.memberships m 
        where m.id = membership_id and m.user_id = auth.uid() and m.status = 'active'
    ) and
    exists (
        -- Election is active
        select 1 from public.elections e
        where e.id = election_id and e.is_active = true and now() between e.start_date and e.end_date
    )
  );

create policy "Admins can record postal votes."
  on public.votes for insert with check (
    method = 'postal' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Annual Audits Policies
-- Using RLS to allow updating the audit if the token matches (via a service role or edge function typically, 
-- but here we might just use the server client to bypass RLS for token-based updates).
create policy "Admins can manage annual audits."
  on public.annual_audits for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- A generic policy for viewing if the user owns the membership
create policy "Users can view own audits."
  on public.annual_audits for select using (
    exists (select 1 from public.memberships where id = membership_id and user_id = auth.uid())
  );
