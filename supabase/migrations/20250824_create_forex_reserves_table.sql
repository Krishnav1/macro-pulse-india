-- Create forex_reserves_weekly table
CREATE TABLE IF NOT EXISTS public.forex_reserves_weekly (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week_ended DATE NOT NULL UNIQUE,
    total_reserves_inr_crore NUMERIC,
    total_reserves_usd_mn NUMERIC,
    foreign_currency_assets_inr_crore NUMERIC,
    foreign_currency_assets_usd_mn NUMERIC,
    gold_inr_crore NUMERIC,
    gold_usd_mn NUMERIC,
    sdrs_inr_crore NUMERIC,
    sdrs_usd_mn NUMERIC,
    reserve_position_imf_inr_crore NUMERIC,
    reserve_position_imf_usd_mn NUMERIC,
    source TEXT DEFAULT 'RBI Weekly Statistical Supplement',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forex_reserves_week_ended ON public.forex_reserves_weekly(week_ended DESC);
CREATE INDEX IF NOT EXISTS idx_forex_reserves_created_at ON public.forex_reserves_weekly(created_at);

-- Enable RLS
ALTER TABLE public.forex_reserves_weekly ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read access to forex reserves data" ON public.forex_reserves_weekly
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert access to forex reserves data" ON public.forex_reserves_weekly
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admin update access to forex reserves data" ON public.forex_reserves_weekly
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Allow admin delete access to forex reserves data" ON public.forex_reserves_weekly
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_forex_reserves_updated_at
    BEFORE UPDATE ON public.forex_reserves_weekly
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
