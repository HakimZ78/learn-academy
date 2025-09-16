# Supabase Setup Sequence - IMPORTANT!

## Step 1: Run the Schema (Already Done ✓)
Your schema SQL is complete and correct. Run it in Supabase SQL Editor:
```sql
-- Run the entire contents of supabase-schema.sql
```

## Step 2: Create Admin User via Supabase Dashboard
Since SQL user creation is having issues, use the Dashboard:

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Invite"** button (top right)
3. Enter email: `hakim@learn-academy.co.uk`
4. Click "Send Invitation"
5. Check your email and set your password

OR

1. Click **"Add user"** → **"Create new user"**
2. Email: `hakim@learn-academy.co.uk`
3. Password: [Your chosen password]
4. Auto Confirm Email: ✓ (check this)
5. Click "Create User"

## Step 3: Verify Admin Role
After creating the user, run this SQL to verify:
```sql
-- Check if profile was created with admin role
SELECT * FROM profiles;
```

If the profile wasn't created (trigger didn't fire), manually create it:
```sql
-- Manually create admin profile if needed
INSERT INTO profiles (id, role, full_name)
SELECT 
  id,
  'admin'::user_role,
  'Hakim'
FROM auth.users 
WHERE email = 'hakim@learn-academy.co.uk'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin'::user_role;
```

## Step 4: Test Login
1. Go to your website: `/portal/login`
2. Login with:
   - Email: `hakim@learn-academy.co.uk`
   - Password: [Your password from step 2]
3. You should be redirected to `/portal/admin`

## Troubleshooting

### If trigger doesn't create profile automatically:
```sql
-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### If you still can't create a user:
The issue might be with Supabase's auth settings. Check:
1. **Dashboard** → **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Check "Email Settings" for any restrictions

### Alternative: Local Development
For local testing without Supabase auth:
```sql
-- Create a test admin profile directly (for development only)
INSERT INTO profiles (
  id, 
  role, 
  full_name
) VALUES (
  gen_random_uuid(), 
  'admin'::user_role, 
  'Hakim (Dev)'
);
```

## Important Notes
- Your schema is **complete and correct**
- All tables are properly defined
- The trigger at line 265 automatically makes `hakim@learn-academy.co.uk` an admin
- The issue is only with user creation, not the schema itself