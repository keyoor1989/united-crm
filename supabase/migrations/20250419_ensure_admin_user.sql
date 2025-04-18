
-- This migration ensures that admin users can be properly created

-- First, make sure the role column in app_users accepts all possible values
ALTER TABLE IF EXISTS public.app_users 
ALTER COLUMN role TYPE TEXT USING role::TEXT;

-- Create a function to automatically insert admin users if they don't exist
CREATE OR REPLACE FUNCTION public.ensure_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the email contains 'admin' or is the specific admin email
  -- and there's no corresponding entry in app_users yet
  IF (NEW.email LIKE '%admin%' OR NEW.email = 'copierbazar@gmail.com') AND
     NOT EXISTS (SELECT 1 FROM public.app_users WHERE id = NEW.id) THEN
    
    -- Insert a default admin record
    INSERT INTO public.app_users (
      id,
      name,
      email,
      mobile,
      role,
      is_active
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
      'super_admin',
      true
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add a trigger to create admin users automatically upon signup
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.ensure_admin_user();
