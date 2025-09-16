-- FIX ADMIN SETUP - Run these commands in order

-- Step 1: Check if any users exist
SELECT id, email, created_at FROM auth.users;

-- Step 2: If you see your user (hakim@learn-academy.co.uk), copy its ID and run:
-- Replace 'YOUR-USER-ID-HERE' with the actual ID from step 1
/*
INSERT INTO profiles (id, role, full_name)
VALUES (
  'YOUR-USER-ID-HERE'::uuid,  -- Paste the ID from step 1 here
  'admin'::user_role,
  'Hakim'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin'::user_role;
*/

-- Step 3: If NO users exist, the trigger might be the problem
-- Let's recreate it with better error handling:
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profile doesn't exist
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'hakim@learn-academy.co.uk' THEN 'admin'::user_role
      ELSE 'student'::user_role
    END,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)  -- Use email prefix as name
    )
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent errors if profile exists
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 5: If user exists but no profile, create it manually
-- First, find your user:
SELECT id, email FROM auth.users WHERE email = 'hakim@learn-academy.co.uk';

-- Then create profile with that ID (uncomment and run):
/*
INSERT INTO profiles (id, role, full_name)
SELECT 
  id,
  'admin'::user_role,
  'Hakim'
FROM auth.users 
WHERE email = 'hakim@learn-academy.co.uk'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);
*/

-- Step 6: Verify admin profile exists
SELECT 
  p.*,
  u.email 
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin';

-- Step 7: If still having issues, create a simple admin check
-- This creates a profile for ANY existing user with your email
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'hakim@learn-academy.co.uk'
  LIMIT 1;
  
  -- Create profile if user exists
  IF user_id IS NOT NULL THEN
    INSERT INTO profiles (id, role, full_name)
    VALUES (user_id, 'admin'::user_role, 'Hakim')
    ON CONFLICT (id) 
    DO UPDATE SET role = 'admin'::user_role;
    
    RAISE NOTICE 'Admin profile created for user ID: %', user_id;
  ELSE
    RAISE NOTICE 'No user found with email hakim@learn-academy.co.uk';
  END IF;
END $$;