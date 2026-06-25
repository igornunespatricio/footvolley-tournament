#!/bin/bash

# Production Setup Script
# This script prepares a Linux server for production deployment

set -e

echo "🔧 Setting up Production Environment"
echo "====================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root (sudo)"
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Install Nginx
echo "📦 Installing Nginx..."
apt-get install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Create application user
echo "👤 Creating application user..."
useradd -m -s /bin/bash footvolley || echo "User already exists"

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/footvolley
chown footvolley:footvolley /var/www/footvolley

# Configure PostgreSQL
echo "🗄️  Configuring PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database user and database
echo "📝 Creating database..."
sudo -u postgres psql << EOF || true
CREATE USER footvolley WITH PASSWORD 'footvolley123';
CREATE DATABASE footvolley OWNER footvolley;
ALTER USER footvolley CREATEDB;
EOF

# Configure Nginx
echo "🌐 Configuring Nginx..."
cp nginx.conf /etc/nginx/sites-available/footvolley
ln -s /etc/nginx/sites-available/footvolley /etc/nginx/sites-enabled/footvolley || true
rm /etc/nginx/sites-enabled/default || true

# Test Nginx configuration
nginx -t

# Start services
echo "🚀 Starting services..."
systemctl start nginx
systemctl enable nginx

# Create SSL certificates (replace with your domain)
echo "🔒 Setting up SSL (optional)..."
echo "Run: sudo certbot certonly --nginx -d your-domain.com"

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Update nginx.conf with your domain name"
echo "2. Generate SSL certificates: sudo certbot certonly --nginx -d your-domain.com"
echo "3. Clone the repository: git clone <repo> /var/www/footvolley"
echo "4. Setup backend: cd /var/www/footvolley/backend && npm install"
echo "5. Create .env file with production credentials"
echo "6. Run migrations: npm run migrate"
echo "7. Start with PM2: pm2 start server.js --name tournament-api"
echo "8. Build frontend: cd ../frontend && npm install && npm run build"
echo "9. Configure Nginx: sudo nginx -s reload"
