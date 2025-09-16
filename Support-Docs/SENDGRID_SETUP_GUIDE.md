# SendGrid Setup Guide for Learn Academy

## Why SendGrid?
- ✅ **Free tier**: 100 emails/day forever
- ✅ **No port blocking issues**: Uses HTTPS API, not SMTP
- ✅ **95%+ inbox delivery rate**
- ✅ **Email tracking**: Opens, clicks, bounces
- ✅ **Professional templates**
- ✅ **Works perfectly with IONOS restrictions**

## Step 1: Create SendGrid Account

1. Go to [https://signup.sendgrid.com/](https://signup.sendgrid.com/)
2. Sign up for free account
3. Use:
   - Email: admin@learn-academy.co.uk
   - Company: Learn Academy
   - Website: learn-academy.co.uk

## Step 2: Verify Your Account

1. Check your email for verification link
2. Complete the verification process
3. Fill in company details when asked

## Step 3: Authenticate Your Domain

### In SendGrid Dashboard:
1. Go to **Settings → Sender Authentication**
2. Click **"Authenticate Your Domain"**
3. Select **"IONOS"** as your DNS host (or "Other" if not listed)
4. Enter domain: `learn-academy.co.uk`
5. SendGrid will give you DNS records to add

### In IONOS DNS Settings:
Add these records (SendGrid will provide the exact values):

```
# CNAME Records for Domain Authentication
Type: CNAME
Host: em1234 (SendGrid will provide)
Points to: u1234567.wl123.sendgrid.net

Type: CNAME  
Host: s1._domainkey
Points to: s1.domainkey.u1234567.wl123.sendgrid.net

Type: CNAME
Host: s2._domainkey  
Points to: s2.domainkey.u1234567.wl123.sendgrid.net
```

## Step 4: Create API Key

1. In SendGrid: **Settings → API Keys**
2. Click **"Create API Key"**
3. Name: `Learn Academy Messaging`
4. Select **"Full Access"** (or "Restricted" with Mail Send permission)
5. **COPY THE KEY** - you won't see it again!

## Step 5: Add to Your .env.local

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=admin@learn-academy.co.uk
SENDGRID_FROM_NAME=Learn Academy
```

## Step 6: Install SendGrid Package

```bash
npm install @sendgrid/mail
```

## Step 7: Update Your Email Sending Code

Replace the nodemailer code with SendGrid API:

```typescript
// app/api/admin/send-message/route.ts
import sgMail from '@sendgrid/mail'

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

// Send email
const msg = {
  to: recipient.email,
  from: {
    email: process.env.SENDGRID_FROM_EMAIL!,
    name: process.env.SENDGRID_FROM_NAME!
  },
  subject: subject,
  text: plainTextContent,
  html: htmlContent,
}

try {
  await sgMail.send(msg)
  console.log('Email sent successfully')
} catch (error) {
  console.error('SendGrid error:', error)
}
```

## Step 8: SendGrid Dashboard Links

### Quick Links to Add to Admin Dashboard:
- **Dashboard**: https://app.sendgrid.com/
- **Statistics**: https://app.sendgrid.com/statistics
- **Activity Feed**: https://app.sendgrid.com/email_activity
- **Templates**: https://mc.sendgrid.com/dynamic-templates
- **API Keys**: https://app.sendgrid.com/settings/api_keys
- **Sender Authentication**: https://app.sendgrid.com/settings/sender_auth

## Step 9: Monitor Your Emails

In SendGrid Dashboard you can see:
- ✅ How many emails sent
- ✅ How many opened
- ✅ How many clicked links
- ✅ Bounce rate
- ✅ Spam reports
- ✅ Real-time activity feed

## Free Tier Limits
- **100 emails/day** forever free
- **3,000 emails** in first month
- After that: 100/day

## For More Emails (If Needed)
- **Essentials Plan**: $19.95/month for 50,000 emails
- **Pro Plan**: $89.95/month for 100,000 emails + advanced features

## Troubleshooting

### If emails still go to spam:
1. Complete domain authentication (Step 3)
2. Wait 24-48 hours for DNS propagation
3. Warm up your sending (start with few emails, gradually increase)
4. Use good email practices (avoid spam words, personalize)

### If API key doesn't work:
1. Check it's copied correctly (no spaces)
2. Ensure it has Mail Send permission
3. Check SendGrid account isn't suspended

## Benefits Over Current SMTP Setup
| Feature | Current (IONOS SMTP) | SendGrid |
|---------|---------------------|----------|
| Delivery Rate | ~60-70% | 95%+ |
| Goes to Spam | Often | Rarely |
| Port Blocking | Yes (587,993,995) | No (uses HTTPS) |
| Email Tracking | No | Yes |
| Templates | Basic | Professional |
| Analytics | None | Detailed |
| Support | Limited | Excellent |

## Next Steps
1. Sign up for SendGrid
2. Add API key to .env.local
3. I'll update your code to use SendGrid
4. Test with better delivery!