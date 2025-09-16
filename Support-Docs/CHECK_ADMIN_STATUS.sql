-- CHECK YOUR ADMIN STATUS

-- 1. Check your profile
SELECT 
  p.id,
  p.role,
  p.full_name,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id = 'ae4c2e43-8605-4b5c-aa8f-40a6326eadd8'::uuid;

-- If the above returns nothing or role is not 'admin', run this:
-- INSERT INTO profiles (id, role, full_name)
-- VALUES ('ae4c2e43-8605-4b5c-aa8f-40a6326eadd8'::uuid, 'admin'::user_role, 'Hakim')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;

-- 2. Check if you also have a student record (might be confusing the system)
SELECT * FROM students WHERE user_id = 'ae4c2e43-8605-4b5c-aa8f-40a6326eadd8'::uuid;