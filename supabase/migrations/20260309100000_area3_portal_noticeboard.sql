-- AREA 3: MEMBER PORTAL & NOTICEBOARD EXTENSIONS

-- 1. Volunteer & Donation Preferences
alter table public.memberships 
  add column willing_to_volunteer boolean default false,
  add column volunteer_roles text[] default '{}'::text[],
  add column willing_to_donate boolean default false,
  add column donation_types text[] default '{}'::text[];

-- 2. Society Updates (Noticeboard)
create type update_content_type as enum ('newsletter', 'announcement', 'financial', 'general');

create table public.society_updates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  type update_content_type default 'general'::update_content_type not null,
  author_id uuid references public.profiles(id) on delete set null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Member Notifications (Individual Messages)
create table public.member_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  title text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------------------------------
alter table public.society_updates enable row level security;
alter table public.member_notifications enable row level security;

-- Society Updates Policies
-- Admins can manage all updates
create policy "Admins can manage society updates."
  on public.society_updates for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Active members can read published updates
create policy "Active members can read published updates."
  on public.society_updates for select using (
    is_published = true and 
    exists (select 1 from public.memberships where user_id = auth.uid() and status = 'active')
  );

-- Member Notifications Policies
-- Admins can manage all notifications
create policy "Admins can manage member notifications."
  on public.member_notifications for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Users can view and update (mark as read) their own notifications
create policy "Users can view own notifications."
  on public.member_notifications for select using (user_id = auth.uid());

create policy "Users can update own notifications."
  on public.member_notifications for update using (user_id = auth.uid());
