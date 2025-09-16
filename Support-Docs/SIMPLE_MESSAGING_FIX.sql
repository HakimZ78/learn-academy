-- SIMPLE MESSAGING SYSTEM FIX
-- Run each step individually in Supabase SQL Editor

-- ====================
-- STEP 1: Create message templates table first
-- ====================

CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('welcome', 'assignment', 'progress', 'reminder', 'general')) NOT NULL,
  variables JSONB,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- STEP 2: Create admin messages table
-- ====================

CREATE TABLE admin_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('individual', 'group', 'program', 'all')) DEFAULT 'individual',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')) DEFAULT 'draft',
  template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL
);

-- ====================
-- STEP 3: Create message recipients table
-- ====================

CREATE TABLE message_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE,
  recipient_type TEXT CHECK (recipient_type IN ('student', 'parent', 'both')) NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')) DEFAULT 'pending',
  error_message TEXT,
  UNIQUE(message_id, student_id, recipient_type)
);

-- ====================
-- STEP 4: Create message attachments table
-- ====================

CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- STEP 5: Add basic templates
-- ====================

INSERT INTO message_templates (name, description, subject, content, category) VALUES
('Welcome Message', 'Welcome new students', 'Welcome to Learn Academy!', 'Dear student, welcome to Learn Academy!', 'welcome'),
('Assignment Reminder', 'Remind about assignments', 'Assignment Reminder', 'Please complete your assignment.', 'reminder'),
('Progress Update', 'Share progress with parents', 'Progress Update', 'Your child is making good progress.', 'progress');

-- ====================
-- STEP 6: Enable RLS (run as separate queries)
-- ====================

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;  
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- ====================
-- STEP 7: Create RLS policies
-- ====================

CREATE POLICY "Admin access to messages" ON admin_messages FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admin access to recipients" ON message_recipients FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admin access to templates" ON message_templates FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admin access to attachments" ON message_attachments FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));