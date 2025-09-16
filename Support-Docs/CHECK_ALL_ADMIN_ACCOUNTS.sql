-- CHECK ALL ADMIN ACCOUNTS
-- This will show ALL users and their admin status

-- ==============================================
-- STEP 1: Check ALL users in auth.users table
-- ==============================================

SELECT 'ALL USER ACCOUNTS IN AUTH.USERS:' as info;
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN email LIKE '%admin%' OR email LIKE '%hakim%' THEN '👤 Potential Admin'
    ELSE '👥 Regular User'
  END as user_type
FROM auth.users
ORDER BY created_at DESC;

-- ==============================================
-- STEP 2: Check which users have profiles
-- ==============================================

SELECT 'USERS WITH PROFILES:' as info;
SELECT 
  u.email,
  u.id as user_id,
  u.created_at as account_created,
  p.role,
  p.full_name,
  CASE 
    WHEN p.role = 'admin' THEN '✅ ADMIN ACCESS'
    WHEN p.role = 'student' THEN '📚 Student Access'
    ELSE '❓ Unknown Role'
  END as access_level
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- ==============================================
-- STEP 3: Specifically check for admin emails
-- ==============================================

SELECT 'CHECKING SPECIFIC ADMIN EMAILS:' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@learn-academy.co.uk') 
    THEN '✅ admin@learn-academy.co.uk EXISTS'
    ELSE '❌ admin@learn-academy.co.uk NOT FOUND'
  END as admin_email_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'hakim@learn-academy.co.uk') 
    THEN '✅ hakim@learn-academy.co.uk EXISTS'
    ELSE '❌ hakim@learn-academy.co.uk NOT FOUND'
  END as hakim_email_status;

-- ==============================================
-- STEP 4: Check if admin@learn-academy.co.uk was deleted
-- ==============================================

-- Note: If the account was deleted, it won't show in auth.users
-- But we can check if there are any orphaned references

SELECT 'CHECKING FOR ORPHANED DATA:' as info;
SELECT 
  'Students table' as table_name,
  COUNT(*) as count
FROM students 
WHERE email = 'admin@learn-academy.co.uk';

-- ==============================================
-- STEP 5: Show all admin-role profiles
-- ==============================================

SELECT 'ALL ADMIN PROFILES:' as info;
SELECT 
  u.email,
  p.full_name,
  u.created_at,
  u.last_sign_in_at,
  '✅ Has Admin Access' as status
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin'
ORDER BY u.last_sign_in_at DESC NULLS LAST;

-- ==============================================
-- RECOVERY OPTIONS:
-- ==============================================

-- If admin@learn-academy.co.uk doesn't exist but you want it:
-- 
-- Option 1: Create new admin@learn-academy.co.uk account
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Email: admin@learn-academy.co.uk
-- 4. Password: AdminPass123
-- 5. Check "Auto Confirm Email"
-- 6. Then run this to make it admin:
/*
INSERT INTO profiles (id, role, full_name)
SELECT id, 'admin'::user_role, 'Hakim Zaehid (Admin Account)'
FROM auth.users 
WHERE email = 'admin@learn-academy.co.uk'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
*/

-- Option 2: Continue using hakim@learn-academy.co.uk
-- You already have admin access with this account
-- Just login with hakim@learn-academy.co.uk and your password