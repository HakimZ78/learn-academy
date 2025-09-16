#!/bin/bash

# Learn Academy VPS Deployment Script
# Run this on your VPS after uploading the project files

set -e  # Exit on any error

echo "🚀 Starting Learn Academy Deployment..."
echo "======================================="

# Configuration
APP_DIR="/var/www/learn-academy"
PM2_NAME="learn-academy"
DOMAIN="learn-academy.co.uk"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if running as forexuser
if [ "$USER" != "forexuser" ]; then
    print_error "Please run this script as forexuser"
    exit 1
fi

# Step 1: System Updates
echo ""
echo "📦 Step 1: Updating System Packages..."
echo "--------------------------------------"
sudo apt update && sudo apt upgrade -y
print_status "System packages updated"

# Step 2: Install Node.js 20.x if not present
echo ""
echo "📦 Step 2: Installing Node.js 20.x..."
echo "--------------------------------------"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed"
else
    print_status "Node.js already installed: $(node -v)"
fi

# Step 3: Install global packages
echo ""
echo "📦 Step 3: Installing Global Packages..."
echo "--------------------------------------"
sudo npm install -g pm2
print_status "PM2 installed globally"

# Step 4: Install Nginx if not present
echo ""
echo "🌐 Step 4: Installing Nginx..."
echo "--------------------------------------"
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Step 5: Create application directory
echo ""
echo "📁 Step 5: Setting up Application Directory..."
echo "--------------------------------------"
sudo mkdir -p $APP_DIR
sudo chown forexuser:forexuser $APP_DIR
print_status "Application directory ready at $APP_DIR"

# Step 6: Check if files need to be uploaded
echo ""
echo "📂 Step 6: Application Files Check..."
echo "--------------------------------------"
if [ ! -f "$APP_DIR/package.json" ]; then
    print_warning "Application files not found!"
    echo "Please upload your files using:"
    echo "scp -P 2222 -r /Users/hakim/Documents/Development/learn-academy/* forexuser@217.154.33.169:$APP_DIR/"
    echo ""
    echo "After uploading, run this script again."
    exit 0
else
    print_status "Application files found"
fi

# Step 7: Install dependencies
echo ""
echo "📦 Step 7: Installing Dependencies..."
echo "--------------------------------------"
cd $APP_DIR
npm install --production
print_status "Dependencies installed"

# Step 8: Build the application
echo ""
echo "🔨 Step 8: Building Application..."
echo "--------------------------------------"
npm run build
print_status "Application built successfully"

# Step 9: Create PM2 ecosystem file
echo ""
echo "⚙️ Step 9: Configuring PM2..."
echo "--------------------------------------"
cat > $APP_DIR/ecosystem.config.js << 'EOF'
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
print_status "PM2 ecosystem configured"

# Step 10: Create log directory
echo ""
echo "📝 Step 10: Setting up Logging..."
echo "--------------------------------------"
sudo mkdir -p /var/log/pm2
sudo chown forexuser:forexuser /var/log/pm2
print_status "Log directory created"

# Step 11: Start application with PM2
echo ""
echo "🚀 Step 11: Starting Application..."
echo "--------------------------------------"
pm2 stop $PM2_NAME 2>/dev/null || true
pm2 delete $PM2_NAME 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
print_status "Application started with PM2"

# Step 12: Setup PM2 startup
echo ""
echo "🔄 Step 12: Configuring PM2 Startup..."
echo "--------------------------------------"
pm2 startup systemd -u forexuser --hp /home/forexuser | grep sudo | bash
print_status "PM2 startup configured"

# Step 13: Configure Nginx
echo ""
echo "🌐 Step 13: Configuring Nginx..."
echo "--------------------------------------"
sudo tee /etc/nginx/sites-available/learn-academy > /dev/null << 'EOF'
server {
    listen 80;
    server_name learn-academy.co.uk www.learn-academy.co.uk;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

sudo ln -sf /etc/nginx/sites-available/learn-academy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
print_status "Nginx configured and reloaded"

# Step 14: Configure firewall
echo ""
echo "🔒 Step 14: Configuring Firewall..."
echo "--------------------------------------"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 2222/tcp
print_status "Firewall rules added"

# Step 15: Install Certbot for SSL
echo ""
echo "🔐 Step 15: Installing Certbot..."
echo "--------------------------------------"
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    print_status "Certbot installed"
else
    print_status "Certbot already installed"
fi

echo ""
echo "======================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "======================================="
echo ""
echo "📋 Next Steps:"
echo "1. Configure DNS: Point learn-academy.co.uk to 217.154.33.169"
echo "2. Once DNS is ready, run SSL setup:"
echo "   sudo certbot --nginx -d learn-academy.co.uk -d www.learn-academy.co.uk"
echo ""
echo "📊 Useful Commands:"
echo "- View status: pm2 status"
echo "- View logs: pm2 logs learn-academy"
echo "- Restart app: pm2 restart learn-academy"
echo "- Monitor: pm2 monit"
echo ""
echo "🌐 Your site will be available at:"
echo "   http://$DOMAIN (after DNS setup)"
echo "   http://217.154.33.169 (immediately)"
echo ""
print_status "Deployment script completed successfully!"