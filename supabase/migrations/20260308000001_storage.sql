-- Enable storage
insert into storage.buckets (id, name, public) 
values ('profile_photos', 'profile_photos', true)
on conflict (id) do nothing;

-- Enable RLS
-- Skip manual RLS enablement as it's handled by Supabase and requires higher privileges
-- alter table storage.objects enable row level security;

-- Policy: Anyone can view profile photos
create policy "Anyone can view profile photos"
  on storage.objects for select
  using ( bucket_id = 'profile_photos' );

-- Policy: Authenticated users can upload their own photos
create policy "Users can upload their own profile photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile_photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can update their own photos
create policy "Users can update their own profile photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile_photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can delete their own photos
create policy "Users can delete their own profile photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile_photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
