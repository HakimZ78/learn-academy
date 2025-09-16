-- CREATE LOGIN FOR ALEX JOHNSON

-- Step 1: First create Alex as a user in Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Email: alex.johnson@example.com
-- Password: AlexStudent123! (or whatever you prefer)
-- Auto Confirm: ✓

-- Step 2: After creating the user, get their ID
SELECT id, email FROM auth.users WHERE email = 'alex.johnson@example.com';

-- Step 3: Create profile for Alex (replace USER_ID with actual ID from step 2)
-- Example SQL - Replace 'USER_ID_HERE' with the actual UUID from step 2
/*
INSERT INTO profiles (
  id,
  role,
  full_name
) VALUES (
  'USER_ID_HERE'::uuid,  -- Replace with actual user ID
  'student'::user_role,
  'Alex Johnson'
);
*/

-- Step 4: Update the existing student record to link to the new user
-- Replace 'USER_ID_HERE' with the actual UUID from step 2
/*
UPDATE students 
SET user_id = 'USER_ID_HERE'::uuid
WHERE email = 'alex.johnson@example.com';
*/

-- Step 5: Create a test material for Alex to view
INSERT INTO materials (
  title,
  description,
  week_number,
  subject,
  program_level,
  file_path,
  content_html,
  is_active
) VALUES (
  'Foundation Week 1: Numbers and Counting',
  'Introduction to basic number concepts',
  1,
  'mathematics'::subject_type,
  'foundation'::program_level,
  '/materials/foundation-week1-numbers.html',
  '<h1>Foundation Mathematics: Week 1</h1>
<h2>Numbers and Counting</h2>
<p>Welcome to your first week of Foundation Mathematics!</p>
<h3>Learning Objectives:</h3>
<ul>
<li>Count from 1 to 100</li>
<li>Understand place value (ones, tens)</li>
<li>Compare numbers using > and < symbols</li>
</ul>
<h3>Practice Questions:</h3>
<p>1. Count from 1 to 20 out loud</p>
<p>2. Which number is bigger: 15 or 8?</p>
<p>3. Write the number that comes after 29</p>
<p>4. Circle the tens digit in 47</p>',
  true
);

-- Step 6: Assign the material to Alex
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
WHERE s.email = 'alex.johnson@example.com'
AND m.title = 'Foundation Week 1: Numbers and Counting'
ON CONFLICT (student_id, material_id) DO NOTHING;

-- Step 7: Verify Alex's setup
SELECT 
  s.full_name,
  s.email,
  s.program_type,
  CASE 
    WHEN s.user_id IS NOT NULL THEN 'Can Login'
    ELSE 'No Login Yet'
  END as login_status,
  COUNT(sa.id) as assigned_materials
FROM students s
LEFT JOIN student_assignments sa ON s.id = sa.student_id
WHERE s.email = 'alex.johnson@example.com'
GROUP BY s.id, s.full_name, s.email, s.program_type, s.user_id;