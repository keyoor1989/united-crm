
-- Create warehouses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some sample warehouse data if the table is empty
INSERT INTO public.warehouses (name, code, location, address, contact_person, contact_phone, is_active)
SELECT 'Main Warehouse', 'MAIN', 'Chennai', '123 Main Street, Chennai', 'Admin', '1234567890', true
WHERE NOT EXISTS (SELECT 1 FROM public.warehouses LIMIT 1);

INSERT INTO public.warehouses (name, code, location, address, contact_person, contact_phone, is_active)
SELECT 'Branch Warehouse 1', 'BR1', 'Mumbai', '456 Branch Street, Mumbai', 'Manager', '9876543210', true
WHERE NOT EXISTS (SELECT 1 FROM public.warehouses WHERE code = 'BR1');

INSERT INTO public.warehouses (name, code, location, address, contact_person, contact_phone, is_active)
SELECT 'Branch Warehouse 2', 'BR2', 'Delhi', '789 Branch Avenue, Delhi', 'Supervisor', '5678901234', true
WHERE NOT EXISTS (SELECT 1 FROM public.warehouses WHERE code = 'BR2');
