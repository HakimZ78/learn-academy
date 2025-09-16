-- ADD TEST STUDENT WITH YOUR GMAIL ADDRESS
-- This will let you test the messaging system by sending to yourself

-- ==============================================
-- STEP 1: Add a test student with your Gmail
-- ==============================================

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
  null,  -- No login needed for testing messages
  'zaehid.hakim78@gmail.com',  -- YOUR GMAIL
  'Hakim Test Student',
  'gcse'::program_level,
  '2008-01-01'::date,
  'zaehid.hakim78@gmail.com',  -- Also use your Gmail as parent email
  'Hakim (Parent)',
  true,
  'Test student for messaging system - sends to my Gmail'
) ON CONFLICT (email) DO UPDATE SET
  active = true,
  parent_email = 'zaehid.hakim78@gmail.com',
  notes = 'Test student for messaging system - sends to my Gmail';

-- ==============================================
-- STEP 2: Add another test student if needed
-- ==============================================

-- You can add more test students with different emails
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
  'test.student@example.com',
  'Test Student',
  'a-level'::program_level,
  '2007-06-15'::date,
  'parent@example.com',
  'Test Parent',
  true,
  'Generic test student'
) ON CONFLICT (email) DO NOTHING;

-- ==============================================
-- STEP 3: Verify students were added
-- ==============================================

SELECT 'Students available for messaging:' as info;
SELECT 
  full_name,
  email,
  parent_email,
  program_type,
  active,
  CASE 
    WHEN email = 'zaehid.hakim78@gmail.com' THEN '✅ Your Gmail - messages will reach you!'
    ELSE '📧 Test email'
  END as status
FROM students
WHERE active = true
ORDER BY created_at DESC;

-- ==============================================
-- HOW TO TEST MESSAGING:
-- ==============================================
-- 1. Go to /portal/admin/messages/compose
-- 2. Select Message Type: "Individual"
-- 3. Click "Add Students"
-- 4. Select "Hakim Test Student" from the list
-- 5. Choose "Send to": Student, Parent, or Both
-- 6. Fill in subject and message
-- 7. Click "Send Now"
-- 8. Check your Gmail (zaehid.hakim78@gmail.com)
-- ==============================================