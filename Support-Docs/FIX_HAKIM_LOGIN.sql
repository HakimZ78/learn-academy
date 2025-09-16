-- FIX LOGIN FOR hakim@learn-academy.co.uk

-- ==============================================
-- STEP 1: Verify the account exists and has admin role
-- ==============================================

SELECT 'Current status of hakim@learn-academy.co.uk:' as info;
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.confirmed_at,
  p.role,
  p.full_name,
  CASE 
    WHEN u.confirmed_at IS NULL THEN '❌ Email not confirmed'
    WHEN p.role = 'admin' THEN '✅ Admin role confirmed'
    ELSE '❌ Not admin'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'hakim@learn-academy.co.uk';

-- ==============================================
-- STEP 2: Check if email is confirmed
-- ==============================================

-- If email is not confirmed, confirm it:
UPDATE auth.users 
SET 
  confirmed_at = COALESCE(confirmed_at, NOW()),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email = 'hakim@learn-academy.co.uk';

-- ==============================================
-- STEP 3: PASSWORD RESET OPTIONS
-- ==============================================

-- Since we can't see or change passwords directly in SQL,
-- you have THREE options to fix the password:

-- OPTION 1: Reset Password via Supabase Dashboard (EASIEST)
-- --------------------------------------------------------
-- 1. Go to Supabase Dashboard
-- 2. Go to Authentication > Users
-- 3. Find hakim@learn-academy.co.uk
-- 4. Click the three dots menu (...)
-- 5. Select "Send Password Recovery"
-- 6. Check your email for reset link
-- OR
-- 5. Select "Update Password" 
-- 6. Set new password to: AdminPass123

-- OPTION 2: Use Supabase Auth API to reset (if Option 1 doesn't work)
-- --------------------------------------------------------
-- Run this in your browser console at the Supabase dashboard:
/*
await supabase.auth.admin.updateUserById(
  'USER_ID_HERE', // Replace with the ID from Step 1
  { password: 'AdminPass123' }
)
*/

-- OPTION 3: Create a new admin account as backup
-- --------------------------------------------------------
-- If you can't reset the password, create admin@learn-academy.co.uk:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Email: admin@learn-academy.co.uk
-- 4. Password: AdminPass123
-- 5. Check "Auto Confirm Email"

-- Then make it admin:
/*
INSERT INTO profiles (id, role, full_name)
SELECT id, 'admin'::user_role, 'Hakim Zaehid'
FROM auth.users 
WHERE email = 'admin@learn-academy.co.uk'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
*/

-- ==============================================
-- STEP 4: Verify the fix worked
-- ==============================================

SELECT 'After fix - Admin accounts ready for login:' as info;
SELECT 
  u.email,
  p.role,
  CASE 
    WHEN u.confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Not Confirmed'
  END as email_status,
  'Use Supabase Dashboard to set password to AdminPass123' as action_needed
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role = 'admin'
ORDER BY u.created_at DESC;

-- ==============================================
-- LOGIN DETAILS AFTER FIX:
-- ==============================================
-- URL: http://localhost:3003/portal/login
-- Email: hakim@learn-academy.co.uk
-- Password: AdminPass123 (or whatever you set in dashboard)
-- 
-- You'll be automatically redirected to /portal/admin
-- ==============================================