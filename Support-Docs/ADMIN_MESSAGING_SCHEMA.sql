-- ADMIN MESSAGING SYSTEM SCHEMA
-- Database schema for admin-to-student/parent messaging system

-- Message templates for common communications (create first to avoid circular reference)
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('welcome', 'assignment', 'progress', 'reminder', 'general')) NOT NULL,
  variables JSONB, -- Store template variables like {student_name}, {week_number}, etc.
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for admin communications
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

-- Message recipients table (many-to-many)
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


-- Message attachments (optional - for future use)
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_admin_messages_status ON admin_messages(status);
CREATE INDEX idx_admin_messages_created_at ON admin_messages(created_at);
CREATE INDEX idx_admin_messages_scheduled_for ON admin_messages(scheduled_for);
CREATE INDEX idx_message_recipients_message_id ON message_recipients(message_id);
CREATE INDEX idx_message_recipients_student_id ON message_recipients(student_id);
CREATE INDEX idx_message_recipients_delivery_status ON message_recipients(delivery_status);
CREATE INDEX idx_message_templates_category ON message_templates(category);

-- Row Level Security Policies

-- Only admin can access messages
CREATE POLICY "Admin full access to messages" ON admin_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to recipients" ON message_recipients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to templates" ON message_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to attachments" ON message_attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable RLS
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

-- Insert default message templates
INSERT INTO message_templates (name, description, subject, content, category, variables) VALUES
('Welcome Message', 'Welcome new students to the academy', 'Welcome to Learn Academy, {student_name}!', 
'Dear {student_name},

Welcome to Learn Academy! We''re excited to have you join our learning community.

Your program: {program_type}
Your materials will be available in the student portal at: https://learn-academy.co.uk/portal

If you have any questions, please don''t hesitate to reach out.

Best regards,
Hakim
Learn Academy

📱 WhatsApp: +44 7779 602503
📧 Email: admin@learn-academy.co.uk
🌐 Website: learn-academy.co.uk', 
'welcome', 
'{"student_name": "string", "program_type": "string"}'),

('Assignment Reminder', 'Remind students about upcoming assignments', 'Assignment Reminder: Week {week_number}', 
'Dear {student_name},

This is a friendly reminder that you have materials assigned for Week {week_number}: {topic}.

Please review the materials in your student portal before your next session.

Portal: https://learn-academy.co.uk/portal/dashboard

Best regards,
Learn Academy Team', 
'reminder', 
'{"student_name": "string", "week_number": "number", "topic": "string"}'),

('Progress Update', 'Share student progress with parents', 'Progress Update for {student_name}', 
'Dear {parent_name},

I wanted to update you on {student_name}''s progress in the {program_type} program.

{progress_details}

Please let me know if you have any questions or would like to schedule a discussion.

Best regards,
Hakim
Learn Academy', 
'progress', 
'{"student_name": "string", "parent_name": "string", "program_type": "string", "progress_details": "string"}');

-- Create function to get message statistics
CREATE OR REPLACE FUNCTION get_message_stats()
RETURNS TABLE (
  total_messages BIGINT,
  sent_messages BIGINT,
  pending_messages BIGINT,
  failed_messages BIGINT,
  total_recipients BIGINT,
  delivered_recipients BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM admin_messages) as total_messages,
    (SELECT COUNT(*) FROM admin_messages WHERE status = 'sent') as sent_messages,
    (SELECT COUNT(*) FROM admin_messages WHERE status IN ('draft', 'scheduled')) as pending_messages,
    (SELECT COUNT(*) FROM admin_messages WHERE status = 'failed') as failed_messages,
    (SELECT COUNT(*) FROM message_recipients) as total_recipients,
    (SELECT COUNT(*) FROM message_recipients WHERE delivery_status = 'delivered') as delivered_recipients;
END;
$$ LANGUAGE plpgsql;