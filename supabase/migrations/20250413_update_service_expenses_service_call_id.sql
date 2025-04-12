
-- This migration updates the service_expenses table to handle placeholder service_call_id

-- First, we need to make sure that we won't break existing data
-- Create a placeholder entry in service_calls that we can reference
DO $$
BEGIN
    -- Check if the placeholder service call already exists
    IF NOT EXISTS (SELECT 1 FROM service_calls WHERE id = '00000000-0000-0000-0000-000000000000') THEN
        -- Insert a placeholder service call
        INSERT INTO service_calls (
            id, 
            customer_id, 
            customer_name, 
            phone, 
            machine_model, 
            location, 
            issue_type, 
            issue_description, 
            call_type, 
            priority, 
            status
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            '00000000-0000-0000-0000-000000000000',
            'System Generated',
            '0000000000',
            'General',
            'System',
            'Other',
            'System generated service expense',
            'System',
            'Low',
            'Completed'
        );
    END IF;
END $$;

-- Update any existing null service_call_id values to use the placeholder
UPDATE service_expenses
SET service_call_id = '00000000-0000-0000-0000-000000000000'
WHERE service_call_id IS NULL;
