-- Add missing columns to memberships table to support the new application flow
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS profession text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS functional_position text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS position text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS is_non_resident_confirmation boolean DEFAULT false;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS committee_contact_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
