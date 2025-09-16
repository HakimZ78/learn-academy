-- SETUP ADMIN ACCOUNT FOR PORTAL ACCESS
-- Run this in Supabase SQL Editor

-- ==============================================
-- STEP 1: Check if admin user exists
-- ==============================================

SELECT 'Checking for admin user accounts:' as step;
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('admin@learn-academy.co.uk', 'hakim@learn-academy.co.uk', 'zaehid.hakim78@gmail.com')
ORDER BY created_at DESC;

-- ==============================================
-- STEP 2: Check profiles table
-- ==============================================

SELECT 'Checking admin profiles:' as step;
SELECT 
  u.email,
  u.id as user_id,
  p.role,
  p.full_name,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Has admin access'
    ELSE '❌ No admin access - needs fixing'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('admin@learn-academy.co.uk', 'hakim@learn-academy.co.uk', 'zaehid.hakim78@gmail.com');

-- ==============================================
-- STEP 3: Fix admin profile for existing user
-- ==============================================

-- If you see your user ID above but role is not 'admin', run this:
UPDATE profiles 
SET role = 'admin'::user_role, 
    full_name = 'Hakim Zaehid'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin@learn-academy.co.uk', 'hakim@learn-academy.co.uk', 'zaehid.hakim78@gmail.com')
);

-- ==============================================
-- STEP 4: Create profile if it doesn't exist
-- ==============================================

-- This will create admin profile for any user that doesn't have one
INSERT INTO profiles (id, role, full_name)
SELECT 
  u.id, 
  'admin'::user_role, 
  'Hakim Zaehid'
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('admin@learn-academy.co.uk', 'hakim@learn-academy.co.uk', 'zaehid.hakim78@gmail.com')
  AND p.id IS NULL;

-- ==============================================
-- STEP 5: Verify the fix
-- ==============================================

SELECT 'Final admin status:' as verification;
SELECT 
  u.email,
  p.role,
  p.full_name,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Admin access granted - can login to /portal/admin'
    ELSE '❌ Still no admin access'
  END as access_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('admin@learn-academy.co.uk', 'hakim@learn-academy.co.uk', 'zaehid.hakim78@gmail.com');

-- ==============================================
-- IMPORTANT NOTES:
-- ==============================================
-- 
-- If you don't see your user account above, you need to:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Email: admin@learn-academy.co.uk
-- 4. Password: AdminPass123 (or your preferred password)
-- 5. Check "Auto Confirm Email"
-- 6. Then run this SQL script again
--
-- After running this script:
-- 1. Login at: http://localhost:3003/portal/login
-- 2. Email: admin@learn-academy.co.uk
-- 3. Password: AdminPass123 (or whatever you set)
-- 4. You'll be redirected to /portal/admin automatically
-- ==============================================