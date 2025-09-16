# IONOS Port Unblocking Request Template

## Email to IONOS Support

**Subject**: Request to Unblock Email Ports for VPS - Learn Academy Educational Institution

**To**: IONOS Support / VPS Support Team

---

**Dear IONOS Support Team,**

I am writing to request the unblocking of email ports for my VPS server used by Learn Academy, an educational institution.

**Account Details:**
- **VPS IP Address**: 217.154.33.169
- **SSH Port**: 2222
- **Domain**: learn-academy.co.uk
- **Account Holder**: [Your Name]
- **Customer ID**: [Your IONOS Customer ID]

**Business Purpose:**
Learn Academy is a legitimate educational institution providing tutoring and homeschooling services. We require email functionality for:
- Student and parent communications
- Contact form notifications from our website
- Educational correspondence
- Administrative communications

**Technical Requirements:**
We need the following ports unblocked for our mail server:

1. **Port 25** (SMTP) - For receiving emails from external sources
2. **Port 587** (SMTP Submission) - For sending emails with authentication
3. **Port 993** (IMAPS) - For secure IMAP email client access
4. **Port 995** (POP3S) - For secure POP3 email client access

**Current Setup:**
- We have already configured Postfix and Dovecot on our VPS
- SSL certificates are installed and configured
- Email server is functional for internal communications
- We can receive emails from external sources (Gmail, etc.)
- Issue: Cannot access via IMAP/POP3 clients due to port blocking

**Security Measures:**
- Our email server is properly secured with SSL/TLS encryption
- Authentication is required for SMTP submission
- SpamAssassin is configured for spam filtering
- Fail2Ban is installed for intrusion prevention
- Regular security updates are applied

**Educational Institution Verification:**
- Website: https://learnacademy.co.uk
- Business Purpose: Educational services and tutoring
- Target Audience: Students and parents in the UK

**Request:**
Please unblock the above-mentioned email ports for our VPS to enable full email functionality for our educational institution.

We understand that email ports are blocked by default for security reasons, but as a legitimate educational business, we require these services for our operations.

**Contact Information:**
- **Email**: [Your Contact Email]
- **Phone**: [Your Phone Number]
- **Business Hours**: [Your Business Hours]

Thank you for your assistance. Please let me know if you require any additional information or documentation to process this request.

**Best regards,**
[Your Name]
Learn Academy
learn-academy.co.uk

---

## Alternative: Use IONOS Customer Portal

1. **Login to IONOS Customer Portal**
2. **Go to**: My Products → VPS → Network Settings
3. **Look for**: Port Management or Firewall Settings
4. **Request**: Port unblocking for email services
5. **Submit**: Business justification form

---

## Backup Plan: Email Relay Service

If IONOS refuses to unblock ports, consider using:
- **SendGrid** (Twilio SendGrid)
- **Amazon SES**
- **Mailgun**
- **Postmark**

These services provide SMTP relay through standard ports (587/465) that are typically not blocked.

---

## Timeline Expectations

- **Response Time**: 24-48 hours for initial response
- **Resolution Time**: 3-5 business days for port unblocking
- **Alternative Solution**: Email forwarding can be implemented immediately