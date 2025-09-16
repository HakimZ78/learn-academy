# Student Portal Setup Instructions

## 🚀 Quick Setup Guide

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in with your account (password: 42f5NeO6Q0EygpRH as noted)
3. Create a new project named "learn-academy-portal"
4. Choose a strong database password and save it
5. Select the region closest to you (London)
6. Wait for project to initialize (~2 minutes)

#### Get API Keys
1. Go to Settings → API in your Supabase dashboard
2. Copy these values:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - Anon/Public key
   - Service Role key (keep this secret!)

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_ADMIN_EMAIL=hakim@learn-academy.co.uk
```

### 3. Run Database Setup

1. Go to SQL Editor in Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste and run in the SQL editor
4. You should see "Success. No rows returned" message

### 4. Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Click "New bucket"
3. Name it: `materials`
4. Set to Private (uncheck "Public bucket")
5. Click "Create bucket"

### 5. Create Admin Account

Run this SQL in the Supabase SQL Editor to create your admin account:

```sql
-- Create admin user (replace password with a secure one)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
VALUES (
  gen_random_uuid(),
  'hakim@learn-academy.co.uk',
  crypt('your_secure_password_here', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"full_name": "Hakim"}'::jsonb
);
```

**Note**: Replace `your_secure_password_here` with a strong password you'll use to login.

### 6. Test the Portal

1. Start the development server:
```bash
npm run dev
```

2. Visit [http://localhost:3000/portal/login](http://localhost:3000/portal/login)

3. Login with:
   - Email: hakim@learn-academy.co.uk
   - Password: (the password you set above)

4. You should be redirected to the admin dashboard

### 7. Migrate Existing Materials (Optional)

If you have existing HTML files to import:

1. Edit `scripts/migrate-materials.js` if needed to adjust the source directory
2. Run the migration:
```bash
node scripts/migrate-materials.js
```

## 📝 Usage Guide

### For Admin (You)

#### Adding Students
1. Go to Admin Dashboard
2. Click "Add New Student"
3. Fill in student details
4. Student will receive login credentials via email (implement email service)

#### Uploading Materials
1. Go to Admin Dashboard
2. Click "Upload Material"
3. Select HTML file
4. Fill in metadata (title, subject, week, etc.)
5. Click Upload

#### Creating Assignments
1. Go to Admin Dashboard
2. Click "Create Assignment"
3. Select student(s)
4. Select material(s)
5. Set access dates
6. Click Assign

### For Students

#### Accessing Materials
1. Login at `/portal/login`
2. View assigned materials on dashboard
3. Click "View Material" to read
4. Materials are view-only (no download/print)
5. Click "Mark as Complete" when done

## 🔒 Security Features

### Copy Protection
- Right-click disabled
- Text selection disabled
- Print disabled (CSS + JavaScript)
- Copy/paste blocked
- Download prevented

### Access Control
- Row Level Security (RLS) enabled
- Students only see assigned materials
- Time-based access restrictions
- Session tracking
- Activity logging

## 🛠️ Maintenance

### Regular Tasks
1. **Monitor Usage**: Check access logs weekly
2. **Update Materials**: Upload new materials as needed
3. **Student Management**: Add/remove students as enrollment changes
4. **Database Backup**: Supabase handles automatic backups

### Troubleshooting

#### Student Can't Login
- Check student record exists in database
- Verify email/password combination
- Check if account is active

#### Material Not Showing
- Verify assignment exists
- Check access dates (start/end)
- Ensure material is marked as active

#### Upload Fails
- Check file size (< 50MB)
- Verify HTML format
- Check storage bucket permissions

## 📊 Database Management

### View Data in Supabase
1. Go to Table Editor in dashboard
2. Browse tables:
   - `students` - All student records
   - `materials` - All uploaded materials
   - `student_assignments` - Assignment links
   - `access_logs` - View history

### Export Data
1. Go to Table Editor
2. Select table
3. Click "Export" → Choose format (CSV/JSON)

## 🚀 Production Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Custom Domain
1. Add custom domain in Vercel
2. Update Supabase allowed URLs
3. Test thoroughly

## 📧 Email Notifications (Future)

To add email notifications:
1. Set up email service (SendGrid/Resend)
2. Add email templates
3. Implement notification triggers
4. Test with students

## 🆘 Support

### Supabase Issues
- Check [Supabase Status](https://status.supabase.com)
- Review [Supabase Docs](https://supabase.com/docs)
- Contact Supabase support

### Application Issues
- Check browser console for errors
- Verify environment variables
- Review server logs
- Test in incognito mode

## ✅ Checklist

- [x] Supabase project created
- [x] Environment variables configured
- [x] Database schema applied
- [x] Storage bucket created
- [x] Admin account created
- [x] Portal tested locally
- [x] First material uploaded
- [x] First student created
- [x] First assignment made
- [x] Student login tested

## 🎉 Success!

Your student portal is now ready. Students can securely access their pre-session materials online, and you have full control over content distribution.

Remember: Materials are VIEW-ONLY. Students cannot download, print, or copy content.