-- CREATE TEST STUDENT LOGINS
-- Run these steps to create actual login credentials for your test students

-- STEP 1: Go to Supabase Dashboard > Authentication > Users > Add User
-- Create these users:

-- Student 1:
-- Email: jane.smith@example.com
-- Password: TestStudent123!
-- Auto Confirm Email: ✓. bb541dc7-82aa-4141-bb9c-464749c71270

-- Student 2:  
-- Email: alex.johnson@example.com
-- Password: TestStudent123!
-- Auto Confirm Email: ✓

-- STEP 2: After creating users in dashboard, run this SQL to get their IDs:
SELECT id, email FROM auth.users 
WHERE email IN ('jane.smith@example.com', 'alex.johnson@example.com');

-- STEP 3: Update your students table with the user IDs
-- Replace the UUIDs below with the actual IDs from Step 2

-- Update Jane Smith (replace with actual user ID)
/*
UPDATE students 
SET user_id = 'bb541dc7-82aa-4141-bb9c-464749c71270'::uuid
WHERE email = 'jane.smith@example.com';

-- Create profile for Jane
INSERT INTO profiles (id, role, full_name)
VALUES ('JANE_USER_ID_HERE'::uuid, 'student'::user_role, 'Jane Smith')
ON CONFLICT (id) DO NOTHING;
*/

-- Update Alex Johnson (replace with actual user ID)
/*
UPDATE students 
SET user_id = 'ALEX_USER_ID_HERE'::uuid
WHERE email = 'alex.johnson@example.com';

-- Create profile for Alex
INSERT INTO profiles (id, role, full_name)
VALUES ('ALEX_USER_ID_HERE'::uuid, 'student'::user_role, 'Alex Johnson')
ON CONFLICT (id) DO NOTHING;
*/

-- STEP 4: Verify setup
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