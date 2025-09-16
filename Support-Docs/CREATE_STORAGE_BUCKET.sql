-- CREATE STORAGE BUCKET FOR MATERIALS
-- Run this in Supabase SQL Editor

-- Note: Storage buckets can't be created via SQL directly
-- You need to create them in the Supabase Dashboard

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard
-- 2. Click on "Storage" in the left sidebar
-- 3. Click "New bucket"
-- 4. Name: materials
-- 5. Public bucket: OFF (keep it private)
-- 6. Click "Create bucket"

-- After creating the bucket, run this to set up policies:

-- Allow authenticated users to upload (admin only)
CREATE POLICY "Admin can upload materials" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'materials' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow authenticated users to view materials
CREATE POLICY "Users can view materials" ON storage.objects
FOR SELECT USING (
  bucket_id = 'materials' AND
  auth.role() = 'authenticated'
);

-- Allow admin to delete materials
CREATE POLICY "Admin can delete materials" ON storage.objects
FOR DELETE USING (
  bucket_id = 'materials' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admin to update materials
CREATE POLICY "Admin can update materials" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'materials' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);