-- Create Gift Aid Declarations table
CREATE TABLE IF NOT EXISTS gift_aid_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    town TEXT NOT NULL,
    postcode TEXT NOT NULL,
    is_uk_taxpayer BOOLEAN NOT NULL DEFAULT TRUE,
    confirmed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on gift_aid_declarations
ALTER TABLE gift_aid_declarations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for gift_aid_declarations
CREATE POLICY "Users can view their own declarations" ON gift_aid_declarations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own declarations" ON gift_aid_declarations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create Donations table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id), -- Optional for anonymous? But society prefers tracking.
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'GBP',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed')),
    is_gift_aid_eligible BOOLEAN DEFAULT FALSE,
    gift_aid_declaration_id UUID REFERENCES gift_aid_declarations(id),
    sumup_checkout_id TEXT,
    sumup_transaction_id TEXT,
    payment_method TEXT DEFAULT 'sumup',
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for donations
CREATE POLICY "Users can view their own donations" ON donations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own donations" ON donations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add donation type to payments if we want to centralize
-- ALTER TYPE payment_cycle ADD VALUE 'donation'; -- Cannot do this easily in migration without care.
-- Instead, we will use the donations table separately for now to avoid breaking existing membership logic.
