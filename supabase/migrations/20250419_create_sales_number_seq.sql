
-- Create a sequence for sales numbers if it doesn't already exist
CREATE SEQUENCE IF NOT EXISTS sales_number_seq START WITH 1;

-- Create a function to get the next value from the sequence
CREATE OR REPLACE FUNCTION get_next_sales_number()
RETURNS TABLE (last_value bigint) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Get the current value
  RETURN QUERY SELECT nextval('sales_number_seq');
END;
$$;

-- Ensure the sales table has a sales_number column
ALTER TABLE sales ADD COLUMN IF NOT EXISTS sales_number TEXT UNIQUE;

-- Update existing sales to have a number if they don't already
WITH numbered_sales AS (
  SELECT id, 
         'SALE-' || TO_CHAR(ROW_NUMBER() OVER (ORDER BY created_at), 'FM0000') as new_number
  FROM sales
  WHERE sales_number IS NULL
)
UPDATE sales 
SET sales_number = numbered_sales.new_number
FROM numbered_sales 
WHERE sales.id = numbered_sales.id;

-- Make sales_number required for future entries
ALTER TABLE sales ALTER COLUMN sales_number SET NOT NULL;
