# Password Reset Guide for hakim@learn-academy.co.uk

## ✅ EASIEST METHOD - Supabase Dashboard

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**

### Step 2: Find Your Account
Look for the user with email: `hakim@learn-academy.co.uk`

### Step 3: Reset Password
1. Click the **three dots menu (⋮)** next to the user
2. Select **"Update Password"**
3. Enter new password: `AdminPass123`
4. Click **Save**

### Step 4: Test Login
1. Go to: `http://localhost:3003/portal/login`
2. Email: `hakim@learn-academy.co.uk`
3. Password: `AdminPass123`
4. You should be redirected to `/portal/admin`

---

## 🔧 Alternative Method - Create New Admin Account

If the password reset doesn't work, create a fresh admin account:

### Step 1: Create New User in Supabase
1. Go to **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   - Email: `admin@learn-academy.co.uk`
   - Password: `AdminPass123`
   - ✅ Check **"Auto Confirm Email"**
4. Click **Create User**

### Step 2: Make it Admin
Run this SQL in Supabase SQL Editor:

```sql
-- Make the new account admin
INSERT INTO profiles (id, role, full_name)
SELECT id, 'admin'::user_role, 'Hakim Zaehid'
FROM auth.users 
WHERE email = 'admin@learn-academy.co.uk'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
```

### Step 3: Login with New Account
1. Go to: `http://localhost:3003/portal/login`
2. Email: `admin@learn-academy.co.uk`
3. Password: `AdminPass123`

---

## 📝 Important Notes

- The portal uses **Supabase Authentication**, not a simple password
- You need a user in `auth.users` table WITH an admin profile in `profiles` table
- The password cannot be changed via SQL - only through Supabase Dashboard
- Your `hakim@learn-academy.co.uk` account exists and has admin role ✅
- You just need to reset the password to something you know

---

## 🚨 If Still Having Issues

Check that your account is properly set up:

```sql
-- Run this to verify your account status
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Has admin access - just needs password reset'
    ELSE '❌ Missing admin role'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('hakim@learn-academy.co.uk', 'admin@learn-academy.co.uk');
```

The account exists and has admin role - you just need to reset the password in the Supabase Dashboard!