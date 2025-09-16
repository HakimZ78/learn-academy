-- CREATE TEST STUDENT ACCOUNT

-- 1. First create a test user in auth.users
-- Note: You'll need to create this user through Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Email: test.student@learn-academy.co.uk
-- Password: TestStudent123! (or whatever you prefer)

-- 2. After creating the user in dashboard, get their ID:
SELECT id, email FROM auth.users WHERE email = 'test.student@learn-academy.co.uk';

-- 3. Create profile for test student (replace USER_ID with actual ID from step 2)
-- Example: If the user ID is 'abc123...' then use that
/*
INSERT INTO profiles (
  id,
  role,
  full_name
) VALUES (
  'USER_ID_HERE'::uuid,  -- Replace with actual ID from step 2
  'student'::user_role,
  'Test Student'
);
*/

-- 4. Create student record
INSERT INTO students (
  user_id,
  email,
  full_name,
  program_type,
  date_of_birth,
  parent_email,
  parent_name,
  active,
  notes
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'test.student@learn-academy.co.uk'),
  'test.student@learn-academy.co.uk',
  'Test Student',
  'gcse'::program_level,
  '2008-06-15'::date,  -- Example DOB (16 years old)
  'parent@example.com',
  'Test Parent',
  true,
  'Test student account for portal testing'
);

-- 5. Assign some materials to the test student
INSERT INTO student_assignments (
  student_id,
  material_id,
  due_date,
  access_start,
  access_end
)
SELECT 
  s.id,
  m.id,
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW() + INTERVAL '30 days'
FROM students s
CROSS JOIN materials m
WHERE s.email = 'test.student@learn-academy.co.uk'
LIMIT 3  -- Assign first 3 materials
ON CONFLICT (student_id, material_id) DO NOTHING;

-- 6. Verify the test student setup
SELECT 
  s.*,
  COUNT(sa.id) as assigned_materials
FROM students s
LEFT JOIN student_assignments sa ON s.id = sa.student_id
WHERE s.email = 'test.student@learn-academy.co.uk'
GROUP BY s.id;

-- ============================================
-- QUICK ALTERNATIVE: Create student without auth user
-- (This won't allow login but creates the record)
-- ============================================

INSERT INTO students (
  id,
  user_id,
  email,
  full_name,
  program_type,
  date_of_birth,
  parent_email,
  parent_name,
  active,
  notes
) VALUES (
  gen_random_uuid(),
  null,  -- No auth user yet
  'jane.smith@example.com',
  'Jane Smith',
  'a-level'::program_level,
  '2007-03-20'::date,
  'parent.smith@example.com',
  'John Smith',
  true,
  'A-Level Biology student - Year 12'
);

-- Another test student
INSERT INTO students (
  id,
  user_id,
  email,
  full_name,
  program_type,
  date_of_birth,
  parent_email,
  parent_name,
  active,
  notes
) VALUES (
  gen_random_uuid(),
  null,
  'alex.johnson@example.com',
  'Alex Johnson',
  'foundation'::program_level,
  '2014-09-10'::date,
  'parent.johnson@example.com',
  'Sarah Johnson',
  true,
  'Foundation program - Year 6'
);

-- View all students
SELECT 
  full_name,
  email,
  program_type,
  active,
  CASE 
    WHEN user_id IS NOT NULL THEN 'Can Login'
    ELSE 'No Login Yet'
  END as login_status
FROM students
ORDER BY created_at DESC;