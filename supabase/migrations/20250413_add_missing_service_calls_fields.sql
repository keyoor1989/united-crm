
-- Add missing fields to service_calls table if they don't exist
DO $$
BEGIN
    -- Add service_charge field if it doesn't exist
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_calls' AND column_name = 'service_charge') THEN
        ALTER TABLE service_calls ADD COLUMN service_charge NUMERIC DEFAULT 0;
    END IF;

    -- Add is_paid field if it doesn't exist
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_calls' AND column_name = 'is_paid') THEN
        ALTER TABLE service_calls ADD COLUMN is_paid BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add payment_date field if it doesn't exist
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_calls' AND column_name = 'payment_date') THEN
        ALTER TABLE service_calls ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add payment_method field if it doesn't exist
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_calls' AND column_name = 'payment_method') THEN
        ALTER TABLE service_calls ADD COLUMN payment_method TEXT;
    END IF;

    -- Add parts_reconciled field if it doesn't exist
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'service_calls' AND column_name = 'parts_reconciled') THEN
        ALTER TABLE service_calls ADD COLUMN parts_reconciled BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add leave_end_date to engineers table if it doesn't exist
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'engineers' AND column_name = 'leave_end_date') THEN
        ALTER TABLE engineers ADD COLUMN leave_end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
