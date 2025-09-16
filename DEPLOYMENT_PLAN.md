# Learn Academy - IONOS VPS Deployment Plan

## Server Details
- **VPS Provider**: IONOS VPS Linux L
- **IP Address**: 217.154.33.169
- **SSH Port**: 2222
- **SSH User**: forexuser
- **OS**: Ubuntu 22.04 LTS

## Pre-Deployment Checklist

### Local Preparation
- [ ] Build production-ready Next.js application
- [ ] Test build locally
- [ ] Ensure all environment variables are documented
- [ ] Backup current VPS configuration

### Security Requirements
- [ ] Generate strong secrets for production
- [ ] Configure SSL certificate (Let's Encrypt)
- [ ] Set up firewall rules
- [ ] Configure security headers

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    IONOS VPS                            │
│                 217.154.33.169                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Nginx (Port 80/443)                 │  │
│  │          SSL Termination & Reverse Proxy         │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────▼─────────────────────────────────┐  │
│  │         Next.js Application (Port 3000)          │  │
│  │              PM2 Process Manager                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              PostgreSQL/Supabase                 │  │
│  │            (External or Local)                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Step-by-Step Deployment

### Phase 1: Server Preparation

```bash
# 1. Connect to VPS
ssh -p 2222 forexuser@217.154.33.169

# 2. Update system packages
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install PM2 globally
sudo npm install -g pm2

# 5. Install Nginx
sudo apt install nginx -y

# 6. Install Git
sudo apt install git -y

# 7. Create application directory
sudo mkdir -p /var/www/learn-academy
sudo chown forexuser:forexuser /var/www/learn-academy
```

### Phase 2: Application Setup

```bash
# 1. Clone repository (or upload via SCP)
cd /var/www
git clone [your-repo-url] learn-academy
# OR upload files:
# scp -P 2222 -r /Users/hakim/Documents/Development/learn-academy/* forexuser@217.154.33.169:/var/www/learn-academy/

# 2. Navigate to app directory
cd /var/www/learn-academy

# 3. Install dependencies
npm install

# 4. Create .env.local file
cat > .env.local << 'EOF'
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://learn-academy.co.uk
NODE_ENV=production

# Security
NEXTAUTH_SECRET=generate_strong_secret_here
NEXTAUTH_URL=https://learn-academy.co.uk
EOF

# 5. Build the application
npm run build

# 6. Test the build
npm start
# Press Ctrl+C to stop after verifying it works
```

### Phase 3: PM2 Configuration

```bash
# 1. Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'learn-academy',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/learn-academy',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/learn-academy-error.log',
    out_file: '/var/log/pm2/learn-academy-out.log',
    log_file: '/var/log/pm2/learn-academy-combined.log',
    time: true
  }]
};
EOF

# 2. Create log directory
sudo mkdir -p /var/log/pm2
sudo chown forexuser:forexuser /var/log/pm2

# 3. Start application with PM2
pm2 start ecosystem.config.js

# 4. Save PM2 process list
pm2 save

# 5. Setup PM2 to start on boot
pm2 startup systemd -u forexuser --hp /home/forexuser
# Follow the command it outputs
```

### Phase 4: Nginx Configuration

```bash
# 1. Create Nginx configuration
sudo nano /etc/nginx/sites-available/learn-academy

# Add the following configuration:
```

```nginx
server {
    listen 80;
    server_name learn-academy.co.uk www.learn-academy.co.uk;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Redirect to HTTPS (once SSL is configured)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files with caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /images {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# 2. Enable the site
sudo ln -s /etc/nginx/sites-available/learn-academy /etc/nginx/sites-enabled/

# 3. Test Nginx configuration
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx
```

### Phase 5: SSL Certificate Setup

```bash
# 1. Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. Obtain SSL certificate
sudo certbot --nginx -d learn-academy.co.uk -d www.learn-academy.co.uk

# 3. Test auto-renewal
sudo certbot renew --dry-run

# 4. Setup auto-renewal cron job (if not already done)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Phase 6: Firewall Configuration

```bash
# 1. Configure UFW firewall
sudo ufw allow 22/tcp    # Default SSH
sudo ufw allow 2222/tcp  # Custom SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# 2. Verify firewall status
sudo ufw status
```

### Phase 7: Domain Configuration

**At your domain registrar (e.g., GoDaddy, Namecheap):**

1. Create A records:
   - `@` → 217.154.33.169
   - `www` → 217.154.33.169

2. Wait for DNS propagation (5-30 minutes)

3. Test DNS:
```bash
nslookup learn-academy.co.uk
ping learn-academy.co.uk
```

## Post-Deployment Tasks

### Monitoring Setup

```bash
# 1. PM2 monitoring
pm2 monit

# 2. Check logs
pm2 logs learn-academy

# 3. Setup PM2 web dashboard (optional)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### Backup Strategy

```bash
# 1. Create backup script
cat > /home/forexuser/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/forexuser/backups"
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/learn-academy-$DATE.tar.gz /var/www/learn-academy

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /home/forexuser/backup.sh

# 2. Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/forexuser/backup.sh
```

### Security Hardening

```bash
# 1. Install fail2ban
sudo apt install fail2ban -y

# 2. Configure fail2ban for SSH
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
# Set: port = 2222 in [sshd] section

# 3. Restart fail2ban
sudo systemctl restart fail2ban
```

## Rollback Plan

If deployment fails:

```bash
# 1. Stop PM2 process
pm2 stop learn-academy

# 2. Restore previous version
cd /var/www
mv learn-academy learn-academy-failed
mv learn-academy-backup learn-academy

# 3. Restart application
cd /var/www/learn-academy
pm2 restart learn-academy

# 4. Check logs
pm2 logs
```

## Maintenance Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs learn-academy --lines 100

# Restart application
pm2 restart learn-academy

# Reload without downtime
pm2 reload learn-academy

# Update application
cd /var/www/learn-academy
git pull
npm install
npm run build
pm2 reload learn-academy

# Monitor resources
htop
df -h
free -m
```

## Environment Variables Required

Create these in `.env.local`:

```env
# Supabase (from your Supabase project)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application
NEXT_PUBLIC_APP_URL=https://learn-academy.co.uk
NODE_ENV=production

# Security (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://learn-academy.co.uk

# Email (if using email features)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

## Testing Checklist

After deployment, test:

- [ ] Homepage loads
- [ ] All navigation links work
- [ ] Images load properly
- [ ] Contact form submission
- [ ] Student portal login
- [ ] SSL certificate active
- [ ] Mobile responsive
- [ ] Page load speed
- [ ] Error pages (404, 500)
- [ ] Security headers present

## Support Information

- **Server Access**: `ssh -p 2222 forexuser@217.154.33.169`
- **Application Logs**: `pm2 logs learn-academy`
- **Nginx Logs**: `/var/log/nginx/`
- **Application Path**: `/var/www/learn-academy`
- **PM2 Dashboard**: `pm2 monit`

## Notes

- This VPS already hosts other projects, ensure port conflicts are avoided
- Default SSH port 22 may be disabled for security
- Always backup before major updates
- Monitor disk space regularly with `df -h`
- Keep Node.js and dependencies updated

---

**Created**: December 2024
**Last Updated**: December 2024
**Status**: Ready for deployment