-- FIX ADMIN PROFILE FOR admin@learn-academy.co.uk
-- Run this immediately after creating the user in Supabase

-- ==============================================
-- STEP 1: Get the user ID for the new admin account
-- ==============================================

SELECT 'Finding admin@learn-academy.co.uk user ID:' as step;
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'admin@learn-academy.co.uk';

-- Copy the ID from above for reference

-- ==============================================
-- STEP 2: Check if profile exists
-- ==============================================

SELECT 'Checking if profile exists:' as step;
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.role,
  p.full_name,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE - This is why you see "Account Setup Required"'
    WHEN p.role != 'admin' THEN '⚠️ Profile exists but not admin'
    WHEN p.role = 'admin' THEN '✅ Admin profile exists'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@learn-academy.co.uk';

-- ==============================================
-- STEP 3: Create or update the admin profile
-- ==============================================

-- First, try to insert a new profile
INSERT INTO profiles (id, role, full_name)
SELECT 
  id, 
  'admin'::user_role, 
  'Hakim Zaehid (Admin)'
FROM auth.users 
WHERE email = 'admin@learn-academy.co.uk'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin'::user_role,
  full_name = 'Hakim Zaehid (Admin)';

-- ==============================================
-- STEP 4: Verify the fix worked
-- ==============================================

SELECT 'VERIFICATION - Admin profile now exists:' as step;
SELECT 
  u.email,
  p.role,
  p.full_name,
  CASE 
    WHEN p.role = 'admin' THEN '✅ FIXED! You can now login and will be redirected to /portal/admin'
    ELSE '❌ Still not admin - check for errors above'
  END as status
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@learn-academy.co.uk';

-- ==============================================
-- STEP 5: Show all admin accounts
-- ==============================================

SELECT 'All admin accounts in the system:' as info;
SELECT 
  u.email,
  p.full_name,
  u.last_sign_in_at,
  '✅ Can access /portal/admin' as access
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role = 'admin'
ORDER BY u.created_at DESC;

-- ==============================================
-- AFTER RUNNING THIS SCRIPT:
-- ==============================================
-- 1. Go to: http://localhost:3003/portal/login
-- 2. Email: admin@learn-academy.co.uk
-- 3. Password: AdminPass123
-- 4. You'll be automatically redirected to /portal/admin
-- 
-- The "Account Setup Required" message will be gone!
-- ==============================================