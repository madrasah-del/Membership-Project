-- Add business directory and profile fields to memberships
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS business_opt_in boolean DEFAULT false;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS business_type text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS business_website text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS business_contact text;
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS business_description text;
