# Email Forwarding Setup Commands

## Step-by-Step Instructions

### 1. Connect to Your VPS
```bash
ssh -p 2222 forexuser@217.154.33.169
```

### 2. Add Email Forwarding Rule
**Replace `YOUR_GMAIL@gmail.com` with your actual Gmail address:**

```bash
# Add forwarding rule
echo "admin@learn-academy.co.uk    YOUR_GMAIL@gmail.com" | sudo tee -a /etc/postfix/virtual

# Apply the changes
sudo postmap /etc/postfix/virtual

# Reload postfix
sudo systemctl reload postfix

# Test configuration
sudo postfix check
```

### 3. Verify Setup
```bash
# Check if the forwarding rule was added
sudo tail -5 /etc/postfix/virtual

# Check postfix status
sudo systemctl status postfix
```

### 4. Test Email Forwarding

**Option A: Test from command line (on VPS)**
```bash
echo "Test forwarding message" | mail -s "Forwarding Test" admin@learn-academy.co.uk
```

**Option B: Test from Gmail**
- Send an email from your Gmail to `admin@learn-academy.co.uk`
- Check if you receive it back in your Gmail

### 5. Check Mail Logs (if needed)
```bash
sudo tail -f /var/log/mail.log
```

---

## Expected Results

✅ **After setup:**
- Emails to `admin@learn-academy.co.uk` will be forwarded to your Gmail
- You'll receive contact form notifications in Gmail
- Original emails are still stored on the VPS
- Webmail still works at: http://217.154.33.169/

✅ **iPhone Access:**
- Use Gmail app on iPhone to receive Learn Academy emails
- No need for IMAP setup (bypasses IONOS port blocking)

---

## Example Commands (Copy-Paste Ready)

**Replace `hakim.example@gmail.com` with your actual Gmail:**

```bash
# SSH into VPS
ssh -p 2222 forexuser@217.154.33.169

# Add forwarding rule (REPLACE WITH YOUR GMAIL)
echo "admin@learn-academy.co.uk    hakim.example@gmail.com" | sudo tee -a /etc/postfix/virtual

# Apply changes
sudo postmap /etc/postfix/virtual
sudo systemctl reload postfix

# Test it works
echo "Forwarding test from VPS" | mail -s "Test Forward" admin@learn-academy.co.uk
```

---

## To Remove Forwarding Later

```bash
# Edit the virtual file
sudo nano /etc/postfix/virtual

# Remove the line: admin@learn-academy.co.uk    YOUR_GMAIL@gmail.com

# Apply changes
sudo postmap /etc/postfix/virtual
sudo systemctl reload postfix
```

---

## Troubleshooting

**If forwarding doesn't work:**

1. **Check logs:**
   ```bash
   sudo tail -f /var/log/mail.log
   ```

2. **Verify virtual file:**
   ```bash
   sudo cat /etc/postfix/virtual | grep admin
   ```

3. **Test postfix config:**
   ```bash
   sudo postfix check
   ```

4. **Restart services if needed:**
   ```bash
   sudo systemctl restart postfix
   ```

---

**Let me know your Gmail address so I can give you the exact commands to copy-paste!**