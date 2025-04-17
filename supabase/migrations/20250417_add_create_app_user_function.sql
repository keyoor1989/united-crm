
-- Create a function to add app_users with service role permissions
CREATE OR REPLACE FUNCTION public.create_app_user(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_mobile TEXT,
  user_role TEXT,
  user_branch TEXT,
  user_is_active BOOLEAN,
  user_has_set_password BOOLEAN
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Insert the user record into app_users
  INSERT INTO app_users (
    id,
    name,
    email,
    mobile,
    role,
    branch,
    is_active,
    has_set_password
  ) VALUES (
    user_id,
    user_name,
    user_email,
    user_mobile,
    user_role,
    user_branch,
    user_is_active,
    user_has_set_password
  )
  RETURNING to_jsonb(app_users.*) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_app_user TO authenticated;
