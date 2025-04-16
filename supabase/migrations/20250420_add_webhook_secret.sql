
-- Add webhook_secret column to telegram_config table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'telegram_config' 
        AND column_name = 'webhook_secret'
    ) THEN
        ALTER TABLE public.telegram_config ADD COLUMN webhook_secret text;
    END IF;
END $$;
