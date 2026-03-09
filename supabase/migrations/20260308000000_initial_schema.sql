-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create type user_role as enum ('member', 'admin');

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  phone text,
  role user_role default 'member'::user_role not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MEMBERSHIPS
create type membership_status as enum ('pending_payment', 'pending_approval', 'active', 'expired', 'rejected', 'incomplete');

create table public.memberships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  marital_status text,
  address text not null,
  town text not null,
  postcode text not null,
  dependents jsonb default '[]'::jsonb,
  eligibility_criteria_met boolean default false not null,
  proposed_by text,
  seconded_by text,
  photo_url text,
  status membership_status default 'incomplete'::membership_status not null,
  approved_by uuid references public.profiles(id) on delete set null,
  whatsapp_opt_in boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PAYMENTS
create type payment_method_type as enum ('sumup', 'direct_debit', 'bank_transfer', 'cash', 'historical');
create type payment_status as enum ('successful', 'failed', 'pending', 'pending_verification');
create type payment_cycle as enum ('new', 'renewal');

create table public.payments (
  id uuid default gen_random_uuid() primary key,
  membership_id uuid references public.memberships(id) on delete cascade not null,
  sumup_transaction_id text,
  amount numeric(10, 2) not null,
  payment_method payment_method_type not null,
  payment_type payment_cycle default 'new'::payment_cycle not null,
  bank_transfer_reference text,
  bank_transfer_date date,
  collected_by text,
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  is_recurring boolean default false,
  status payment_status default 'pending'::payment_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS) POLICIES

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.payments enable row level security;

-- Profiles Policies
create policy "Users can view own profile."
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile."
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles."
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all profiles."
  on public.profiles for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Memberships Policies
create policy "Users can view own membership."
  on public.memberships for select using (auth.uid() = user_id);

create policy "Users can insert own membership."
  on public.memberships for insert with check (auth.uid() = user_id);

create policy "Users can update own membership."
  on public.memberships for update using (auth.uid() = user_id);

create policy "Admins can view all memberships."
  on public.memberships for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can insert all memberships."
  on public.memberships for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all memberships."
  on public.memberships for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Payments Policies
create policy "Users can view own payments."
  on public.payments for select using (
    exists (select 1 from public.memberships where id = membership_id and user_id = auth.uid())
  );

create policy "Users can insert own payments."
  on public.payments for insert with check (
    exists (select 1 from public.memberships where id = membership_id and user_id = auth.uid())
  );

create policy "Admins can view all payments."
  on public.payments for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all payments."
  on public.payments for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Function to handle new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
