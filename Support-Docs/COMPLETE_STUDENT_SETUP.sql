-- COMPLETE STUDENT SETUP WITH YOUR ACTUAL USER IDS

-- You created Jane Smith with ID: bb541dc7-82aa-4141-bb9c-464749c71270
-- Now let's complete her setup:

-- 1. Create profile for Jane Smith
INSERT INTO profiles (id, role, full_name)
VALUES ('bb541dc7-82aa-4141-bb9c-464749c71270'::uuid, 'student'::user_role, 'Jane Smith')
ON CONFLICT (id) DO UPDATE SET role = 'student'::user_role;

-- 2. Link Jane's student record to her auth account
UPDATE students 
SET user_id = 'bb541dc7-82aa-4141-bb9c-464749c71270'::uuid
WHERE email = 'jane.smith@example.com';

-- 3. For Alex Johnson, you need to:
--    a) Go to Supabase Dashboard > Authentication > Users > Add User
--    b) Email: alex.johnson@example.com
--    c) Password: TestStudent123!
--    d) Auto Confirm Email: ✓
--    e) After creating, get the user ID and run:

-- Get Alex's ID after you create him:
SELECT id, email FROM auth.users WHERE email = 'alex.johnson@example.com';

-- Then run this (replace ALEX_USER_ID with actual ID):
/*
INSERT INTO profiles (id, role, full_name)
VALUES ('ALEX_USER_ID_HERE'::uuid, 'student'::user_role, 'Alex Johnson')
ON CONFLICT (id) DO UPDATE SET role = 'student'::user_role;

UPDATE students 
SET user_id = 'ALEX_USER_ID_HERE'::uuid
WHERE email = 'alex.johnson@example.com';
*/

-- 4. Verify both students are set up correctly:
SELECT 
  s.full_name,
  s.email,
  s.program_type,
  CASE WHEN s.user_id IS NOT NULL THEN 'Can Login ✓' ELSE 'No Login ✗' END as status,
  COUNT(sa.id) as materials_assigned
FROM students s
LEFT JOIN student_assignments sa ON s.id = sa.student_id
WHERE s.email IN ('jane.smith@example.com', 'alex.johnson@example.com')
GROUP BY s.id, s.full_name, s.email, s.program_type, s.user_id;

-- 5. Test login credentials:
-- Jane Smith: jane.smith@example.com / TestStudent123!
-- Alex Johnson: alex.johnson@example.com / TestStudent123! (after setup)