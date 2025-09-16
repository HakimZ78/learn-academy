# Fix Email Spam Issues - Learn Academy

## Why Emails Go to Spam

Your emails are going to spam because:
1. **No SPF Record**: Your domain doesn't authorize your server to send emails
2. **No DKIM Signing**: Emails aren't cryptographically signed
3. **No DMARC Policy**: No domain authentication policy
4. **IP Reputation**: New IP address (217.154.33.169) has no sending history

## Immediate Fix (Do This Now)

### 1. Add SPF Record to Your Domain DNS
Add this TXT record to learn-academy.co.uk DNS (at IONOS):
```
Type: TXT
Host: @ (or leave blank)
Value: v=spf1 ip4:217.154.33.169 include:_spf.ionos.com ~all
```

### 2. Mark as "Not Spam" in Gmail
1. Go to Gmail Spam folder
2. Select all Learn Academy emails
3. Click "Not Spam"
4. Add `admin@learn-academy.co.uk` to your contacts

### 3. Create a Filter in Gmail
1. Gmail Settings → Filters and Blocked Addresses
2. Create new filter
3. From: `*@learn-academy.co.uk`
4. Choose: "Never send to Spam"
5. Apply to matching conversations

## Long-term Solution (Recommended)

### Option 1: Use Professional Email Service
Services like **SendGrid**, **Mailgun**, or **Amazon SES**:
- ✅ Better deliverability (95%+ inbox rate)
- ✅ Automatic SPF/DKIM/DMARC setup
- ✅ Email tracking and analytics
- ✅ Free tier available (100-300 emails/day free)
- ✅ Works with IONOS port blocking

### Option 2: Configure IONOS Email Properly

#### Step 1: Set up SPF, DKIM, and DMARC
In IONOS DNS settings, add these records:

**SPF Record** (as above)
```
TXT @ "v=spf1 ip4:217.154.33.169 include:_spf.ionos.com ~all"
```

**DMARC Record**
```
TXT _dmarc "v=DMARC1; p=none; rua=mailto:admin@learn-academy.co.uk"
```

#### Step 2: Configure Postfix for Better Headers
SSH into your VPS and edit `/etc/postfix/main.cf`:
```bash
# Add these lines
myhostname = mail.learn-academy.co.uk
mydomain = learn-academy.co.uk
myorigin = $mydomain
smtp_helo_name = mail.learn-academy.co.uk
```

Then restart Postfix:
```bash
sudo systemctl restart postfix
```

#### Step 3: Set up DKIM (Advanced)
```bash
# Install OpenDKIM
sudo apt-get install opendkim opendkim-tools

# Generate keys
sudo opendkim-genkey -t -s mail -d learn-academy.co.uk

# Add public key to DNS
# The key will be in /etc/opendkim/keys/learn-academy.co.uk/mail.txt
```

## Quick Test After SPF Setup

1. Send a test email from your messaging system
2. In Gmail, view the original message (three dots → Show original)
3. Look for "SPF: PASS" - this means SPF is working
4. If you see "SPF: FAIL" or "SOFTFAIL", the DNS hasn't propagated yet (wait 1-4 hours)

## For Student/Parent Communications

### Important Considerations:
- **First emails** to new recipients often go to spam
- **Bulk emails** increase spam likelihood
- Consider asking parents to **whitelist** `admin@learn-academy.co.uk`
- Include in your **welcome pack**: "Please add admin@learn-academy.co.uk to your contacts"

### Email Best Practices:
1. **Avoid spam trigger words**: FREE, CLICK HERE, Act Now, Limited Time
2. **Personalize**: Use student/parent names
3. **Clear sender**: Always use admin@learn-academy.co.uk
4. **Unsubscribe option**: Add "Reply STOP to unsubscribe" for compliance
5. **Text/HTML ratio**: Don't use only HTML, include plain text version

## Recommended: SendGrid Integration

Since IONOS blocks ports 587/993/995, SendGrid is perfect:
1. **Free tier**: 100 emails/day forever free
2. **API-based**: No SMTP ports needed
3. **Excellent deliverability**: 95%+ inbox rate
4. **Easy setup**: 10 minutes

### Quick SendGrid Setup:
1. Sign up at sendgrid.com
2. Verify your domain
3. Get API key
4. Update your code to use SendGrid API instead of SMTP

## Summary - Do These Now:

1. ✅ **Add SPF record** to DNS (most important!)
2. ✅ **Whitelist in Gmail** (immediate fix for you)
3. ✅ **Consider SendGrid** for production (best long-term solution)

The SPF record alone should significantly improve deliverability. After adding it, wait 1-4 hours for DNS propagation, then test again!