-- FIX ADMIN ROLE - Your account is set as student, needs to be admin

-- 1. Check current profile role
SELECT 
  p.id,
  p.role,
  p.full_name,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'hakim@learn-academy.co.uk';

-- 2. UPDATE YOUR PROFILE TO ADMIN ROLE
UPDATE profiles 
SET role = 'admin'::user_role
WHERE id = 'ae4c2e43-8605-4b5c-aa8f-40a6326eadd8'::uuid;

-- 3. Verify the update worked
SELECT 
  p.id,
  p.role,
  p.full_name,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'hakim@learn-academy.co.uk';

-- Should show role = 'admin' now