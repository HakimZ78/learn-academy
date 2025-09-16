-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE program_level AS ENUM ('foundation', 'elevate', 'gcse', 'a-level');
CREATE TYPE subject_type AS ENUM ('biology', 'chemistry', 'physics', 'mathematics', 'english');
CREATE TYPE user_role AS ENUM ('admin', 'student', 'parent');

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  program_type program_level NOT NULL,
  date_of_birth DATE,
  parent_email TEXT,
  parent_name TEXT,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  week_number INTEGER,
  subject subject_type NOT NULL,
  program_level program_level NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_type TEXT DEFAULT 'html',
  content_html TEXT, -- Store HTML content directly for view-only display
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student material assignments
CREATE TABLE student_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  access_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_end TIMESTAMP WITH TIME ZONE,
  viewed BOOLEAN DEFAULT false,
  first_viewed_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(student_id, material_id)
);

-- Access logs for monitoring
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  action TEXT CHECK (action IN ('view', 'complete', 'print_attempt', 'copy_attempt')),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_duration INTEGER, -- in seconds
  ip_address INET,
  user_agent TEXT,
  browser TEXT,
  device_type TEXT
);

-- Admin activity logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_active ON students(active);
CREATE INDEX idx_materials_subject ON materials(subject);
CREATE INDEX idx_materials_program ON materials(program_level);
CREATE INDEX idx_materials_week ON materials(week_number);
CREATE INDEX idx_assignments_student ON student_assignments(student_id);
CREATE INDEX idx_assignments_material ON student_assignments(material_id);
CREATE INDEX idx_assignments_dates ON student_assignments(access_start, access_end);
CREATE INDEX idx_access_logs_student ON access_logs(student_id);
CREATE INDEX idx_access_logs_material ON access_logs(material_id);
CREATE INDEX idx_access_logs_date ON access_logs(accessed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for students
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage students" ON students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for materials
CREATE POLICY "Students access assigned materials" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    ) OR
    id IN (
      SELECT material_id FROM student_assignments 
      WHERE student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
      )
      AND access_start <= NOW() 
      AND (access_end IS NULL OR access_end > NOW())
    )
  );

CREATE POLICY "Admin can manage materials" ON materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for student_assignments
CREATE POLICY "Students view own assignments" ON student_assignments
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can update own assignment progress" ON student_assignments
  FOR UPDATE USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage assignments" ON student_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for access_logs
CREATE POLICY "Students can insert own logs" ON access_logs
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all logs" ON access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for admin_logs
CREATE POLICY "Admin can manage admin logs" ON admin_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'hakim@learn-academy.co.uk' THEN 'admin'::user_role
      ELSE 'student'::user_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to track material views
CREATE OR REPLACE FUNCTION track_material_view(
  p_student_id UUID,
  p_material_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update assignment tracking
  UPDATE student_assignments
  SET 
    viewed = true,
    first_viewed_at = CASE 
      WHEN first_viewed_at IS NULL THEN NOW()
      ELSE first_viewed_at
    END,
    last_viewed_at = NOW(),
    view_count = view_count + 1
  WHERE student_id = p_student_id 
    AND material_id = p_material_id;
  
  -- Log the access
  INSERT INTO access_logs (
    student_id,
    material_id,
    action,
    ip_address,
    user_agent
  ) VALUES (
    p_student_id,
    p_material_id,
    'view',
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get student dashboard data
CREATE OR REPLACE FUNCTION get_student_dashboard(p_user_id UUID)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  total_assignments BIGINT,
  completed_assignments BIGINT,
  pending_assignments BIGINT,
  recent_materials JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.full_name,
    COUNT(sa.id) AS total_assignments,
    COUNT(sa.id) FILTER (WHERE sa.completed = true) AS completed_assignments,
    COUNT(sa.id) FILTER (WHERE sa.completed = false AND sa.due_date > NOW()) AS pending_assignments,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'material_id', m.id,
          'title', m.title,
          'subject', m.subject,
          'week_number', m.week_number,
          'due_date', sa.due_date,
          'completed', sa.completed,
          'viewed', sa.viewed
        ) ORDER BY sa.assigned_date DESC
      ) FILTER (WHERE m.id IS NOT NULL),
      '[]'::jsonb
    ) AS recent_materials
  FROM students s
  LEFT JOIN student_assignments sa ON s.id = sa.student_id
  LEFT JOIN materials m ON sa.material_id = m.id
  WHERE s.user_id = p_user_id
    AND s.active = true
  GROUP BY s.id, s.full_name
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage buckets (run in Supabase Dashboard SQL Editor)
-- Note: Storage bucket creation via SQL is not directly supported
-- These commands should be run via Supabase Dashboard or CLI
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false);

-- Storage policies would be set via Dashboard
*/

-- Sample data for testing (optional)
-- This creates a test admin user - replace with actual admin email
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'hakim@learn-academy.co.uk',
  crypt('your_secure_password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
*/