# Deployment to VPS

This guide outlines the complete workflow for deploying changes from your local development environment to your production VPS.

## Prerequisites

- SSH access to VPS (IP: 217.154.33.169)
- Git repository: https://github.com/HakimZ78/learn-academy
- PM2 process manager running on VPS
- Production URL: https://learn-academy.co.uk

## Development Workflow

### 1. Make Changes Locally

Work on your changes in the local development environment:

```bash
# Start development server
npm run dev

# Access at http://localhost:3003
```

### 2. Test Your Changes

Before deploying, always test your build locally:

```bash
# Test the production build
npm run build

# If build succeeds, test it locally
npm start
```

### 3. Commit Changes to Git

Once changes are tested and working:

```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "Your descriptive commit message"

# Push to GitHub
git push origin main
```

## Deployment Process

### Option 1: Manual Deployment (Recommended)

SSH into your VPS and pull the latest changes:

```bash
# Connect to VPS
ssh forexuser@217.154.33.169

# Navigate to project directory
cd /var/www/learn-academy

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
npm ci  # or npm install if package-lock.json has issues

# Build the Next.js application
npm run build

# Restart the PM2 process
pm2 restart learn-academy

# Verify the app is running
pm2 status

# Check logs if needed
pm2 logs learn-academy
```

### Option 2: Quick Deployment Script

Run this one-liner from your local machine (requires SSH key setup):

```bash
ssh forexuser@217.154.33.169 "cd /var/www/learn-academy && git pull origin main && npm ci && npm run build && pm2 restart learn-academy"
```

## Common Deployment Scenarios

### After Email System Changes

```bash
# On VPS
cd /var/www/learn-academy
git pull origin main
npm ci  # Ensures new packages like 'resend' are installed
npm run build
pm2 restart learn-academy
```

### After Environment Variable Changes

If you've updated `.env.local`:

```bash
# On VPS
cd /var/www/learn-academy
git pull origin main

# Edit environment variables
nano .env.local  # Make your changes

# Rebuild with new env vars
npm run build

# Restart with updated environment
pm2 restart learn-academy --update-env
```

### After Database Schema Changes

When Supabase tables or RLS policies change:

1. Make changes in Supabase Dashboard
2. Deploy code changes as normal:

```bash
# On VPS
cd /var/www/learn-academy
git pull origin main
npm run build
pm2 restart learn-academy
```

## Troubleshooting

### Build Failures

If the build fails on VPS:

```bash
# Check error messages
npm run build

# Common fixes:
# 1. Clear Next.js cache
rm -rf .next

# 2. Clear node_modules and reinstall
rm -rf node_modules
npm ci

# 3. Check TypeScript errors
npx tsc --noEmit

# Try building again
npm run build
```

### Application Not Starting

If PM2 can't start the application:

```bash
# Check PM2 logs
pm2 logs learn-academy --lines 50

# Check error log specifically
tail -n 50 /home/forexuser/.pm2/logs/learn-academy-error.log

# Common issue: Missing .next directory
# Solution: Run build first
npm run build
pm2 restart learn-academy
```

### 502 Bad Gateway

If you see 502 errors after deployment:

```bash
# Application likely crashed or isn't running
pm2 status  # Check if app is running

# If stopped, check why
pm2 logs learn-academy --err

# Rebuild and restart
npm run build
pm2 restart learn-academy
```

### Email Not Working

After email configuration changes:

```bash
# Ensure Resend API key is set
grep RESEND_API_KEY .env.local

# Rebuild to include new email configuration
npm run build
pm2 restart learn-academy

# Test email endpoint
curl -X POST https://learn-academy.co.uk/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "type": "simple"}'
```

## PM2 Commands Reference

```bash
# View all processes
pm2 status

# View logs
pm2 logs learn-academy

# Restart application
pm2 restart learn-academy

# Stop application
pm2 stop learn-academy

# Start application
pm2 start learn-academy

# Monitor CPU/Memory
pm2 monit

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

## Verifying Deployment

After deployment, always verify:

1. **Check the live site**: https://learn-academy.co.uk
2. **Test critical features**:
   - Homepage loads
   - Contact form works
   - Student portal login works
   - Admin portal accessible
3. **Monitor logs** for any errors:
   ```bash
   pm2 logs learn-academy --lines 20
   ```

## Rollback Process

If something goes wrong after deployment:

```bash
# On VPS
cd /var/www/learn-academy

# View recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard HEAD~1  # Go back one commit
# OR
git reset --hard <commit-hash>  # Go to specific commit

# Rebuild with previous code
npm run build

# Restart application
pm2 restart learn-academy
```

## Security Notes

- Never commit `.env.local` or any files with secrets
- Always use HTTPS URLs in production
- Keep dependencies updated: `npm audit fix`
- Regularly check PM2 logs for suspicious activity
- Ensure Supabase RLS policies are properly configured

## Quick Checklist

Before deploying, ensure:
- [ ] Code tested locally with `npm run dev`
- [ ] Production build successful with `npm run build`
- [ ] All files committed to Git
- [ ] Pushed to GitHub
- [ ] No sensitive data in commits

After deploying, verify:
- [ ] Site loads without errors
- [ ] Console has no critical errors
- [ ] Email functionality works
- [ ] Database connections work
- [ ] PM2 process is stable

## Contact for Issues

If deployment issues persist:
- Check GitHub Actions (if configured)
- Review Nginx logs: `/var/log/nginx/error.log`
- Check system resources: `df -h` and `free -m`
- Restart Nginx if needed: `sudo systemctl restart nginx`