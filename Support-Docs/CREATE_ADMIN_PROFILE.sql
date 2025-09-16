-- CREATE ADMIN PROFILE FOR HAKIM
-- Run this in Supabase SQL Editor

-- First, check if admin user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@learn-academy.co.uk' 
   OR email = 'hakim@learn-academy.co.uk'
   OR email = 'zaehid.hakim78@gmail.com';

-- Check existing profiles
SELECT * FROM profiles;

-- If you see your user ID from above, use it below
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from the first query

-- Option 1: If you have a user account, create the profile
/*
INSERT INTO profiles (id, role, full_name)
VALUES ('YOUR_USER_ID_HERE'::uuid, 'admin'::user_role, 'Hakim Zaehid')
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
*/

-- Option 2: If you don't have a user account, you need to create one first
-- Go to Supabase Dashboard > Authentication > Users > Add User
-- Email: admin@learn-academy.co.uk
-- Password: (your choice)
-- Then run the profile insert above with the new user ID

-- Option 3: Quick fix - Create admin profile for any existing user
-- (Use this if you have an existing user account but no admin profile)
/*
INSERT INTO profiles (id, role, full_name)
SELECT id, 'admin'::user_role, 'Hakim Zaehid'
FROM auth.users 
WHERE email IN ('admin@learn-academy.co.uk', 'hakim@learn-academy.co.uk', 'zaehid.hakim78@gmail.com')
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
*/

-- Verify admin profile was created
SELECT 
  u.email,
  u.id as user_id,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('admin@learn-academy.co.uk', 'hakim@learn-academy.co.uk', 'zaehid.hakim78@gmail.com');