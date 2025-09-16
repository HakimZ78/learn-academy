#!/bin/bash

# Email Forwarding Setup Script for Learn Academy
# This script sets up email forwarding from admin@learn-academy.co.uk to Gmail

echo "🔧 Setting up email forwarding for Learn Academy..."
echo "This will forward admin@learn-academy.co.uk emails to your Gmail"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root: sudo $0"
    exit 1
fi

# Variables
LEARN_EMAIL="admin@learn-academy.co.uk"
GMAIL_ADDRESS="your-gmail@gmail.com"  # Replace with your actual Gmail

echo "📧 Setting up forwarding from: $LEARN_EMAIL"
echo "📧 Forwarding to: $GMAIL_ADDRESS"
echo ""

# Create postfix virtual alias for forwarding
echo "1️⃣ Creating email forwarding rule..."

# Add forwarding rule to virtual aliases
echo "$LEARN_EMAIL    $GMAIL_ADDRESS" >> /etc/postfix/virtual

# Rebuild virtual alias database
postmap /etc/postfix/virtual

# Reload postfix
systemctl reload postfix

echo "✅ Email forwarding configured!"
echo ""
echo "📋 What this means:"
echo "   • Emails sent to admin@learn-academy.co.uk will be forwarded to your Gmail"
echo "   • You'll receive contact form notifications in Gmail"
echo "   • Original emails are still stored on the VPS"
echo "   • You can still access webmail at: http://217.154.33.169/"
echo ""
echo "🧪 Test forwarding:"
echo "   Send a test email to admin@learn-academy.co.uk"
echo "   Check your Gmail inbox in a few minutes"
echo ""
echo "🔙 To remove forwarding:"
echo "   Edit /etc/postfix/virtual and remove the forwarding line"
echo "   Run: postmap /etc/postfix/virtual && systemctl reload postfix"

# Test configuration
echo "🔍 Testing postfix configuration..."
postfix check

if [ $? -eq 0 ]; then
    echo "✅ Postfix configuration is valid"
else
    echo "❌ Postfix configuration has errors"
fi

echo ""
echo "📱 For iPhone: Use your Gmail app to receive Learn Academy emails"
echo "📧 For sending as admin@learn-academy.co.uk: Configure Gmail to send from this address"