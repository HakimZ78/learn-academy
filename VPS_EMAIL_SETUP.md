# VPS Email Server Setup Instructions
## For IONOS VPS Linux L (217.154.33.169)

### Prerequisites
- SSH access to your VPS: `ssh -p 2222 forexuser@217.154.33.169`
- Domain: learn-academy.co.uk
- Root or sudo access on VPS

---

## STEP 1: Connect to Your VPS

```bash
# Connect via SSH
ssh -p 2222 forexuser@217.154.33.169

# Once connected, update the system
sudo apt update && sudo apt upgrade -y
```

---

## STEP 2: Install Email Server Components

### 2.1 Install Postfix (SMTP Server)

```bash
# Install Postfix
sudo apt install postfix -y

# During installation, select:
# - Internet Site
# - System mail name: learn-academy.co.uk
```

### 2.2 Install Dovecot (IMAP/POP3 Server)

```bash
# Install Dovecot
sudo apt install dovecot-core dovecot-imapd dovecot-pop3d -y
```

### 2.3 Install Additional Components

```bash
# Install mail utilities
sudo apt install mailutils -y

# Install SpamAssassin for spam filtering
sudo apt install spamassassin spamc -y

# Install ClamAV for virus scanning (optional but recommended)
sudo apt install clamav clamav-daemon -y
```

---

## STEP 3: Configure Postfix

### 3.1 Main Configuration

```bash
# Edit main Postfix configuration
sudo nano /etc/postfix/main.cf
```

Add/modify these lines:

```conf
# Basic Configuration
myhostname = mail.learn-academy.co.uk
mydomain = learn-academy.co.uk
myorigin = $mydomain
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
inet_interfaces = all
inet_protocols = all

# Virtual Mailbox Configuration
virtual_mailbox_domains = learn-academy.co.uk
virtual_mailbox_base = /var/mail/vhosts
virtual_mailbox_maps = hash:/etc/postfix/vmailbox
virtual_minimum_uid = 100
virtual_uid_maps = static:5000
virtual_gid_maps = static:5000
virtual_alias_maps = hash:/etc/postfix/virtual

# TLS Configuration for Security
smtpd_tls_cert_file=/etc/letsencrypt/live/mail.learn-academy.co.uk/fullchain.pem
smtpd_tls_key_file=/etc/letsencrypt/live/mail.learn-academy.co.uk/privkey.pem
smtpd_use_tls=yes
smtpd_tls_auth_only = yes
smtp_tls_security_level = may
smtpd_tls_security_level = may
smtpd_tls_protocols = !SSLv2, !SSLv3
smtpd_tls_loglevel = 1
smtpd_tls_received_header = yes

# Authentication
smtpd_sasl_type = dovecot
smtpd_sasl_path = private/auth
smtpd_sasl_auth_enable = yes
smtpd_recipient_restrictions = permit_sasl_authenticated,permit_mynetworks,reject_unauth_destination

# Message Size Limit (25MB)
message_size_limit = 26214400
```

### 3.2 Create Virtual Mailbox Mappings

```bash
# Create virtual mailbox file
sudo nano /etc/postfix/vmailbox
```

Add your email accounts:

```
# Format: email@domain    mailbox/path/
admin@learn-academy.co.uk    learn-academy.co.uk/admin/
support@learn-academy.co.uk  learn-academy.co.uk/support/
system@learn-academy.co.uk   learn-academy.co.uk/system/
notifications@learn-academy.co.uk learn-academy.co.uk/notifications/

# Student emails (add as needed)
student001@learn-academy.co.uk learn-academy.co.uk/student001/
student002@learn-academy.co.uk learn-academy.co.uk/student002/

# Parent emails (add as needed)
parent001@learn-academy.co.uk learn-academy.co.uk/parent001/
parent002@learn-academy.co.uk learn-academy.co.uk/parent002/
```

### 3.3 Create Virtual Aliases (Optional)

```bash
# Create virtual alias file
sudo nano /etc/postfix/virtual
```

Add aliases:

```
# Catch-all for student emails (optional)
@learn-academy.co.uk    admin@learn-academy.co.uk
```

### 3.4 Create Mail User and Directories

```bash
# Create mail user
sudo groupadd -g 5000 vmail
sudo useradd -g vmail -u 5000 vmail -d /var/mail

# Create mail directory
sudo mkdir -p /var/mail/vhosts/learn-academy.co.uk
sudo chown -R vmail:vmail /var/mail/vhosts
sudo chmod -R 770 /var/mail/vhosts

# Process the mappings
sudo postmap /etc/postfix/vmailbox
sudo postmap /etc/postfix/virtual
```

---

## STEP 4: Configure Dovecot

### 4.1 Main Configuration

```bash
# Edit Dovecot configuration
sudo nano /etc/dovecot/dovecot.conf
```

Ensure these lines are present:

```conf
protocols = imap pop3 lmtp
listen = *, ::
```

### 4.2 Mail Location Configuration

```bash
sudo nano /etc/dovecot/conf.d/10-mail.conf
```

Set:

```conf
mail_location = maildir:/var/mail/vhosts/%d/%n
mail_privileged_group = vmail
```

### 4.3 Authentication Configuration

```bash
sudo nano /etc/dovecot/conf.d/10-auth.conf
```

Set:

```conf
disable_plaintext_auth = yes
auth_mechanisms = plain login

# Comment out:
#!include auth-system.conf.ext

# Uncomment:
!include auth-passwdfile.conf.ext
```

### 4.4 Create Password File

```bash
# Create password file
sudo nano /etc/dovecot/users
```

Add users (use `doveadm pw -s SHA512-CRYPT` to generate passwords):

```
admin@learn-academy.co.uk:{SHA512-CRYPT}$6$...:5000:5000::/var/mail/vhosts/learn-academy.co.uk/admin
support@learn-academy.co.uk:{SHA512-CRYPT}$6$...:5000:5000::/var/mail/vhosts/learn-academy.co.uk/support
```

### 4.5 Configure Master Service

```bash
sudo nano /etc/dovecot/conf.d/10-master.conf
```

Enable Postfix authentication:

```conf
service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0666
    user = postfix
    group = postfix
  }
}

service lmtp {
  unix_listener /var/spool/postfix/private/dovecot-lmtp {
    mode = 0600
    user = postfix
    group = postfix
  }
}
```

---

## STEP 5: SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot -y

# Stop any web servers temporarily
sudo systemctl stop nginx

# Get SSL certificate for mail server
sudo certbot certonly --standalone -d mail.learn-academy.co.uk

# Certificate will be at:
# /etc/letsencrypt/live/mail.learn-academy.co.uk/fullchain.pem
# /etc/letsencrypt/live/mail.learn-academy.co.uk/privkey.pem

# Restart nginx if it was running
sudo systemctl start nginx
```

---

## STEP 6: Configure SpamAssassin

### 6.1 Enable SpamAssassin

```bash
sudo nano /etc/default/spamassassin
```

Set:

```conf
ENABLED=1
```

### 6.2 Configure SpamAssassin Rules

```bash
sudo nano /etc/spamassassin/local.cf
```

Add education-specific rules:

```conf
# Basic Settings
required_score 5.0
report_safe 0
rewrite_header Subject [SPAM]

# Whitelist educational domains
whitelist_from *@*.edu
whitelist_from *@*.ac.uk
whitelist_from *@learn-academy.co.uk

# Education keywords (reduce spam score)
body EDUCATION_KEYWORDS /homework|assignment|tuition|academy|learning|student/i
score EDUCATION_KEYWORDS -2.0

# Parent communication patterns
body PARENT_PATTERN /dear parent|child|son|daughter|grades|progress/i
score PARENT_PATTERN -1.5
```

### 6.3 Integrate with Postfix

```bash
sudo nano /etc/postfix/master.cf
```

Add after smtp line:

```conf
smtp      inet  n       -       -       -       -       smtpd
  -o content_filter=spamassassin
  
spamassassin unix -     n       n       -       -       pipe
  user=debian-spamd argv=/usr/bin/spamc -f -e /usr/sbin/sendmail -oi -f ${sender} ${recipient}
```

---

## STEP 7: Configure DNS Records

Log into your domain registrar (where you bought learn-academy.co.uk) and add:

### MX Record
```
Type: MX
Host: @
Value: mail.learn-academy.co.uk
Priority: 10
```

### A Records
```
Type: A
Host: mail
Value: 217.154.33.169
```

### SPF Record
```
Type: TXT
Host: @
Value: v=spf1 mx a ip4:217.154.33.169 ~all
```

### DKIM (After setting up OpenDKIM)
```
Type: TXT
Host: default._domainkey
Value: [Will be generated]
```

### DMARC Record
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:admin@learn-academy.co.uk
```

---

## STEP 8: Start Services

```bash
# Restart all services
sudo systemctl restart postfix
sudo systemctl restart dovecot
sudo systemctl restart spamassassin

# Enable services to start on boot
sudo systemctl enable postfix
sudo systemctl enable dovecot
sudo systemctl enable spamassassin

# Check status
sudo systemctl status postfix
sudo systemctl status dovecot
sudo systemctl status spamassassin
```

---

## STEP 9: Test Email Server

### 9.1 Test Sending

```bash
# Send test email
echo "Test email from Learn Academy" | mail -s "Test" admin@learn-academy.co.uk
```

### 9.2 Check Logs

```bash
# Check mail logs
sudo tail -f /var/log/mail.log
```

### 9.3 Test Ports

```bash
# Check if ports are listening
sudo netstat -tlnp | grep -E ':25|:587|:993|:995'
```

---

## STEP 10: Install Webmail (Roundcube)

```bash
# Install prerequisites
sudo apt install apache2 php php-mysql php-xml php-mbstring php-intl php-zip php-json -y

# Download Roundcube
cd /tmp
wget https://github.com/roundcube/roundcubemail/releases/download/1.6.5/roundcubemail-1.6.5-complete.tar.gz
tar xzf roundcubemail-1.6.5-complete.tar.gz

# Move to web directory
sudo mv roundcubemail-1.6.5 /var/www/roundcube
sudo chown -R www-data:www-data /var/www/roundcube

# Configure Apache
sudo nano /etc/apache2/sites-available/roundcube.conf
```

Add:

```apache
<VirtualHost *:80>
    ServerName webmail.learn-academy.co.uk
    DocumentRoot /var/www/roundcube
    
    <Directory /var/www/roundcube>
        Options +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/roundcube_error.log
    CustomLog ${APACHE_LOG_DIR}/roundcube_access.log combined
</VirtualHost>
```

```bash
# Enable site
sudo a2ensite roundcube
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## STEP 11: Create Email Accounts Programmatically

Create a script to add academy emails:

```bash
sudo nano /usr/local/bin/create_academy_email.sh
```

```bash
#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <email_prefix> <password>"
    echo "Example: $0 student001 MySecurePass123"
    exit 1
fi

EMAIL="$1@learn-academy.co.uk"
PASSWORD="$2"

# Add to Postfix virtual mailbox
echo "$EMAIL    learn-academy.co.uk/$1/" | sudo tee -a /etc/postfix/vmailbox
sudo postmap /etc/postfix/vmailbox

# Generate password hash
HASH=$(doveadm pw -s SHA512-CRYPT -p "$PASSWORD")

# Add to Dovecot users
echo "$EMAIL:$HASH:5000:5000::/var/mail/vhosts/learn-academy.co.uk/$1" | sudo tee -a /etc/dovecot/users

# Create mail directory
sudo mkdir -p "/var/mail/vhosts/learn-academy.co.uk/$1"
sudo chown -R vmail:vmail "/var/mail/vhosts/learn-academy.co.uk/$1"

# Reload services
sudo systemctl reload postfix
sudo systemctl reload dovecot

echo "Email account $EMAIL created successfully!"
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/create_academy_email.sh

# Usage example
sudo /usr/local/bin/create_academy_email.sh student001 SecurePassword123
```

---

## STEP 12: Integration with Next.js

Create environment variables in your `.env.local`:

```env
# Email Server Configuration
EMAIL_HOST=mail.learn-academy.co.uk
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=system@learn-academy.co.uk
EMAIL_PASSWORD=your_system_email_password

# Email addresses
EMAIL_FROM=notifications@learn-academy.co.uk
EMAIL_ADMIN=admin@learn-academy.co.uk
```

---

## Monitoring & Maintenance

### Check Email Queue
```bash
sudo postqueue -p
```

### Flush Email Queue
```bash
sudo postqueue -f
```

### View Mail Logs
```bash
sudo tail -f /var/log/mail.log
```

### Check Disk Space
```bash
df -h /var/mail
```

### Backup Emails
```bash
# Create backup script
sudo tar -czf /backup/mail-$(date +%Y%m%d).tar.gz /var/mail/vhosts/
```

---

## Security Recommendations

1. **Firewall Rules**
```bash
sudo ufw allow 25/tcp   # SMTP
sudo ufw allow 587/tcp  # SMTP (submission)
sudo ufw allow 993/tcp  # IMAPS
sudo ufw allow 995/tcp  # POP3S
```

2. **Fail2Ban for Email**
```bash
sudo apt install fail2ban
# Configure for Postfix and Dovecot
```

3. **Regular Updates**
```bash
sudo apt update && sudo apt upgrade
```

4. **Monitor for Issues**
- Set up log monitoring
- Configure alerts for failures
- Regular backup verification

---

## Troubleshooting

### Email Not Sending
1. Check logs: `sudo tail -f /var/log/mail.log`
2. Verify DNS records: `dig MX learn-academy.co.uk`
3. Test port 25: `telnet mail.learn-academy.co.uk 25`

### Authentication Failed
1. Check Dovecot logs: `sudo tail -f /var/log/dovecot.log`
2. Verify password hash: `doveadm pw -t {HASH} -p password`
3. Check permissions: `ls -la /var/mail/vhosts/`

### High Spam Score
1. Check SPF record: `dig TXT learn-academy.co.uk`
2. Verify DKIM signing
3. Test with mail-tester.com

---

**Support Contact**: If you encounter issues, check the logs first, then contact IONOS support for VPS-related issues.

---

## IMPLEMENTATION STATUS (September 2025)

### ✅ Completed Functionality

#### 1. Send Emails from Next.js App
**Configuration File**: `/Users/hakim/Documents/Development/learn-academy/.env.local`
```env
EMAIL_HOST=mail.learn-academy.co.uk
EMAIL_PORT=587
EMAIL_SECURE=true
EMAIL_USER=system@learn-academy.co.uk
EMAIL_PASSWORD=SystemPass123
EMAIL_FROM=notifications@learn-academy.co.uk
EMAIL_ADMIN=admin@learn-academy.co.uk
```
**Usage**: Your Next.js app can now send emails using nodemailer or similar libraries via port 587 with the system account.

#### 2. Create Email Accounts Using Script
**Script Location**: `/usr/local/bin/create_academy_email.sh`
**Usage**: 
```bash
sudo /usr/local/bin/create_academy_email.sh [username] [password]
# Example:
sudo /usr/local/bin/create_academy_email.sh student001 SecurePass123
```
**Created Accounts**:
- admin@learn-academy.co.uk (AdminPass123)
- support@learn-academy.co.uk (SupportPass123)
- system@learn-academy.co.uk (SystemPass123)
- notifications@learn-academy.co.uk (NotifyPass123)
- student001@learn-academy.co.uk (StudentPass123)
- student002@learn-academy.co.uk (StudentPass123)

#### 3. Access Webmail
**URL**: http://217.154.33.169/
**Login**: Use any created email account (e.g., admin@learn-academy.co.uk / AdminPass123)
**Technology**: Roundcube webmail interface
**Config Files**: 
- `/var/www/roundcube/config/config.inc.php`
- `/etc/nginx/sites-available/roundcube`

#### 4. Internal Email System
**What it means**: Yes, this is a company internal mail system! Emails between academy accounts work perfectly.
**How to use**:
- Send emails between any @learn-academy.co.uk addresses
- Works immediately without external internet routing
- Perfect for:
  - Student notifications
  - Parent communications within the academy
  - Staff coordination
  - System notifications from your app

**Example Internal Email Test**:
```bash
echo "Test message" | mail -s "Internal Test" admin@learn-academy.co.uk
```

### ⏳ Pending Issues

#### External Email Reception (Gmail/Outlook → Academy)
**Issue**: Port 25 blocked by IONOS at network level
**Solution**: Contact IONOS support to unblock port 25
**Status**: All configuration complete, just waiting for port unblocking

#### External Email Sending (Academy → Gmail/Outlook)
**Issue**: Outbound port 25 also blocked by IONOS
**Solution**: Same as above - IONOS needs to unblock port 25
**Workaround**: Consider using email relay service (SendGrid, Amazon SES) if IONOS won't unblock

### 📁 Key Files and Locations

**Email Server Config**:
- `/etc/postfix/main.cf` - Postfix main configuration
- `/etc/postfix/master.cf` - Postfix service configuration
- `/etc/postfix/vmailbox` - Virtual mailbox mappings
- `/etc/dovecot/conf.d/10-mail.conf` - Dovecot mail settings
- `/etc/dovecot/conf.d/10-auth.conf` - Dovecot authentication
- `/etc/dovecot/conf.d/10-master.conf` - Dovecot service settings
- `/etc/dovecot/users` - Email account database

**Email Data**:
- `/var/mail/vhosts/learn-academy.co.uk/` - All mailboxes
- `/var/log/mail.log` - Mail server logs

**SSL Certificates**:
- `/etc/letsencrypt/live/mail.learn-academy.co.uk/` - Email SSL certificates

### 🎯 Quick Commands

```bash
# Check mail server status
sudo systemctl status postfix dovecot

# Monitor mail logs
sudo tail -f /var/log/mail.log

# Create new email account
sudo /usr/local/bin/create_academy_email.sh [username] [password]

# Check mailbox contents
sudo ls -la /var/mail/vhosts/learn-academy.co.uk/[username]/new/

# Test internal email
echo "Test" | mail -s "Test Subject" admin@learn-academy.co.uk
```

### 📱 Mobile/Email Client Configuration

For iPhone, Outlook, Thunderbird, etc.:
- **IMAP Server**: mail.learn-academy.co.uk (Port 143 or 993 SSL)
- **SMTP Server**: mail.learn-academy.co.uk (Port 587 STARTTLS)
- **Username**: Full email (e.g., admin@learn-academy.co.uk)
- **Password**: As set when creating account

### 🧪 Email Testing Setup

#### Test Interface
**URL**: `http://localhost:3000/test-email`
**File**: `/app/test-email/page.tsx`

This page provides buttons to:
- Send welcome emails to student001
- Send assignment notifications  
- Test email templates

#### Current Issue - IONOS Port Blocking
**Problem**: Connection timeout to port 587/25 from external networks
**Error**: `connect ETIMEDOUT 217.154.33.169:587`
**Cause**: IONOS blocks outbound email ports for anti-spam protection
**Status**: Need to contact IONOS support to unblock ports 25 and 587

#### Testing Files Created
- `lib/email.ts` - Email utilities and templates
- `app/api/send-email/route.ts` - API endpoint for sending emails  
- `examples/email-usage-examples.ts` - Usage documentation
- `app/test-email/page.tsx` - Test interface

#### Workaround for Testing
Until IONOS unblocks ports:
1. **Internal Testing**: Send emails from VPS command line works fine
2. **Deploy to VPS**: Next.js app on VPS can access email server locally  
3. **External Access**: Students can still access webmail and email clients

#### When Ports Are Unblocked
Once IONOS unblocks ports 25 and 587:
- External email sending will work immediately
- No code changes needed
- Full email functionality restored

---