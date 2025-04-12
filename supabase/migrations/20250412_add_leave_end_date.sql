
-- Add leave_end_date column to engineers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'engineers' AND column_name = 'leave_end_date') THEN
        ALTER TABLE engineers ADD COLUMN leave_end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
