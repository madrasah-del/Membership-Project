-- Enhance Gift Aid support for payments
ALTER TABLE public.gift_aid_declarations ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.gift_aid_declarations ADD COLUMN IF NOT EXISTS declaration_text text;

-- Link payments to gift aid declarations
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS gift_aid_declaration_id uuid REFERENCES public.gift_aid_declarations(id) ON DELETE SET NULL;
