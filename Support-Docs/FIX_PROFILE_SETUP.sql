-- FIX PROFILE SETUP - Create admin profile that's missing

-- 1. Check what we have
SELECT 'Checking auth.users table:' as status;
SELECT id, email FROM auth.users WHERE email = 'hakim@learn-academy.co.uk';

SELECT 'Checking profiles table:' as status;
SELECT * FROM profiles WHERE id = 'ae4c2e43-8605-4b5c-aa8f-40a6326eadd8'::uuid;

SELECT 'Checking students table:' as status;
SELECT * FROM students WHERE email = 'hakim@learn-academy.co.uk';

-- 2. CREATE YOUR ADMIN PROFILE (This is what's missing!)
INSERT INTO profiles (
  id,
  role,
  full_name
) VALUES (
  'ae4c2e43-8605-4b5c-aa8f-40a6326eadd8'::uuid,
  'admin'::user_role,
  'Hakim'
) ON CONFLICT (id) DO UPDATE 
SET role = 'admin'::user_role;

-- 3. Verify profile now exists with admin role
SELECT 
  p.*,
  u.email 
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id = 'ae4c2e43-8605-4b5c-aa8f-40a6326eadd8'::uuid;

-- 4. OPTIONAL: Remove yourself from students table (admins don't need to be students)
-- Uncomment if you want to remove:
-- DELETE FROM students WHERE email = 'hakim@learn-academy.co.uk';

-- Note: Keep the student record if you want to test viewing materials as a student