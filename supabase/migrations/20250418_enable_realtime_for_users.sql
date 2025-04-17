
-- Enable replication identity to track changes to app_users
ALTER TABLE app_users REPLICA IDENTITY FULL;

-- Add app_users to the realtime publication
BEGIN;
  INSERT INTO supabase_realtime.subscription (publication, name, tables)
  VALUES (
    'supabase_realtime', 
    'app_users_subscription', 
    '{public.app_users}'
  )
  ON CONFLICT (publication, name) 
  DO UPDATE SET tables = '{public.app_users}';
COMMIT;
