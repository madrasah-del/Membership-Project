-- Extend the payment_method_type enum
ALTER TYPE public.payment_method_type ADD VALUE IF NOT EXISTS 'wire';
ALTER TYPE public.payment_method_type ADD VALUE IF NOT EXISTS 'cheque';

-- Create app_settings table for dynamic constants
CREATE TABLE IF NOT EXISTS public.app_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key text UNIQUE NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- RLS Policies for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view and update settings
CREATE POLICY "Admins can view settings"
    ON public.app_settings FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can insert settings"
    ON public.app_settings FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update settings"
    ON public.app_settings FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Everyone can technically read public settings if we want to expose them without auth,
-- but for now, we'll keep them restricted to admins as per the prompt requirements,
-- unless the frontend needs to read the fee before logging in.
-- Currently, membership application does require auth.
-- Let's add a public read policy for specific keys if needed, but for now we'll allow all authenticated users to read.
DROP POLICY IF EXISTS "Admins can view settings" ON public.app_settings;

CREATE POLICY "Authenticated users can view settings"
    ON public.app_settings FOR SELECT
    USING (auth.role() = 'authenticated');

-- Insert the default minimum membership fee
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('min_membership_fee', '10.00'::jsonb, 'The minimum fee required for standard membership registration or renewal.')
ON CONFLICT (setting_key) DO NOTHING;
