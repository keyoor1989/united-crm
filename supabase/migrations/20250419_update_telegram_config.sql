
-- Add use_polling column to telegram_config table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'telegram_config' 
        AND column_name = 'use_polling'
    ) THEN
        ALTER TABLE public.telegram_config ADD COLUMN use_polling BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

