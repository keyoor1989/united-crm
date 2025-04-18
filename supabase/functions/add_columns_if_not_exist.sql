
-- Create a function to add columns to a table if they don't already exist
CREATE OR REPLACE FUNCTION add_columns_if_not_exist(
  _table_name text,
  _column_defs jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  column_def jsonb;
  column_name text;
  column_type text;
  column_exists boolean;
BEGIN
  FOR i IN 0..jsonb_array_length(_column_defs) - 1 LOOP
    column_def := jsonb_array_element(_column_defs, i);
    column_name := column_def->>'column_name';
    column_type := column_def->>'column_type';
    
    -- Check if column exists
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = _table_name
      AND column_name = column_name
    ) INTO column_exists;
    
    -- Add column if it doesn't exist
    IF NOT column_exists THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s', _table_name, column_name, column_type);
    END IF;
  END LOOP;
END;
$$;
