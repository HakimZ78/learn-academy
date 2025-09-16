-- Quick add your material to database for testing

-- 1. Insert the material record
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
  'Week 1 Pre-Session Primer',
  'Cell Structure & Microscopy (Combined) - Welcome to Intensive A-Level Biology!',
  1,
  'biology'::subject_type,
  'a-level'::program_level,
  '/materials/week1_pre_session_primer.html',
  -- Paste your HTML content here (read from file)
  '<h1 id="week-1-pre-session-primer-cell-structure-microscopy-combined">Week 1 Pre-Session Primer: Cell Structure &amp; Microscopy (Combined)</h1>
<h2 id="welcome-to-intensive-a-level-biology">Welcome to Intensive A-Level Biology!</h2>
<p>This primer will help you prepare for our first <strong>extended session</strong> covering both microscopy AND complete cell structure. Since we have only 33 weeks to cover everything, our first session combines what would normally be two separate topics. Don''t worry if you can''t answer everything - these questions are to get you thinking about the topics we''ll explore together.</p>
<hr />
<h2 id="part-a-reflection-questions-think-about-these">Part A: Reflection Questions (Think about these)</h2>
<h3 id="scale-and-size---the-invisible-world">Scale and Size - The Invisible World</h3>
<ol type="1">
<li>Look around the room. What''s the smallest thing you can see with your naked eyes?</li>
<li>Why do you think we need microscopes to see cells?</li>
<li>How many times bigger do you think a human hair is compared to a bacterial cell?</li>
<li>If you could shrink down to the size of a molecule, what do you think the inside of a cell would look like?</li>
</ol>
<!-- Add rest of your HTML content here -->',
  true
);

-- 2. Get the material ID and your student ID
SELECT 
  m.id as material_id,
  s.id as student_id,
  m.title
FROM materials m
CROSS JOIN students s
WHERE s.email = 'hakim@learn-academy.co.uk'
AND m.title = 'Week 1 Pre-Session Primer';

-- 3. Assign to your admin student account for testing
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
WHERE s.email = 'hakim@learn-academy.co.uk'
AND m.title = 'Week 1 Pre-Session Primer'
ON CONFLICT (student_id, material_id) DO NOTHING;

-- 4. Verify it's assigned
SELECT 
  m.title,
  m.week_number,
  m.subject,
  m.program_level,
  sa.assigned_date,
  sa.due_date
FROM student_assignments sa
JOIN materials m ON m.id = sa.material_id
JOIN students s ON s.id = sa.student_id
WHERE s.email = 'hakim@learn-academy.co.uk';