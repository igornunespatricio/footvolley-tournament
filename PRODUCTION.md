# Production Deployment Checklist & Guide

## 🚀 Pre-Deployment Checklist

### Code & Repository
- [ ] All code committed to git
- [ ] No sensitive data in code (passwords, keys)
- [ ] .env files added to .gitignore
- [ ] Documentation up to date
- [ ] Code reviewed

### Security
- [ ] Database password is strong (20+ chars, mixed case, numbers, symbols)
- [ ] JWT_SECRET configured (if using authentication)
- [ ] SSL/TLS certificates obtained (Let's Encrypt free)
- [ ] Firewall rules configured
- [ ] CORS_ORIGIN set to frontend domain only
- [ ] Database backups configured

### Performance
- [ ] Frontend build size checked (< 500KB)
- [ ] Database indexes verified
- [ ] Connection pooling configured (20+ connections)
- [ ] Caching headers set in Nginx
- [ ] Gzip compression enabled

### Testing
- [ ] All tests pass locally
- [ ] Integration tests pass
- [ ] Responsive design verified on mobile
- [ ] Cross-browser testing done
- [ ] Load testing performed (optional)

## 📋 Deployment Options

### Option 1: Docker Compose (Recommended - Easiest)

**Prerequisites:**
- Docker installed
- Docker Compose installed
- Git repository cloned

**Steps:**

1. **Configure environment:**
   ```bash
   cp .env.production .env
   # Edit .env with your configuration
   nano .env
   ```

2. **Deploy:**
   ```bash
   ./deploy.sh docker
   ```

3. **Verify:**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

4. **Access:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001/api

**Backup & Recovery:**
```bash
# Backup database
docker-compose exec postgres pg_dump -U footvolley footvolley > backup.sql

# Restore database
docker-compose exec -T postgres psql -U footvolley footvolley < backup.sql

# View logs
docker-compose logs backend
docker-compose logs postgres

# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

### Option 2: Vercel + Render

**Frontend (Vercel):**

1. Push code to GitHub
2. Connect repo to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment: `VITE_API_URL=https://your-render-backend.onrender.com/api`

**Backend (Render):**

1. Create PostgreSQL database
2. Create Web Service from GitHub
3. Set build command: `npm run migrate && npm run seed`
4. Set start command: `npm start`
5. Set environment variables:
   - `DATABASE_URL` = PostgreSQL URL
   - `NODE_ENV` = production
   - `PORT` = 3001

### Option 3: Traditional Linux Server

**Prerequisites:**
- Ubuntu 20.04 LTS or similar
- SSH access
- Sudo privileges
- Domain name with DNS configured

**Steps:**

1. **Run setup script:**
   ```bash
   sudo ./setup-production.sh
   ```

2. **Clone repository:**
   ```bash
   cd /var/www/footvolley
   git clone <repo-url> .
   ```

3. **Setup backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with production values
   npm run migrate
   npm run seed
   ```

4. **Start backend with PM2:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "tournament-api"
   pm2 save
   pm2 startup
   ```

5. **Build frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

6. **Configure Nginx:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/footvolley
   sudo ln -s /etc/nginx/sites-available/footvolley /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL:**
   ```bash
   sudo certbot certonly --nginx -d your-domain.com
   ```

8. **Verify:**
   ```bash
   pm2 logs
   sudo tail -f /var/log/nginx/access.log
   ```

## 🔄 Updating Production

### With Docker:
```bash
git pull
docker-compose build
docker-compose up -d
docker-compose exec backend npm run migrate
```

### With Traditional Server:
```bash
cd /var/www/footvolley
git pull
cd backend
npm install
npm run migrate
pm2 restart tournament-api
cd ../frontend
npm install
npm run build
sudo systemctl restart nginx
```

## 📊 Monitoring

### Docker:
```bash
# View all containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Resource usage
docker stats

# Database backup
docker-compose exec postgres pg_dump -U footvolley footvolley > backup.sql
```

### Traditional Server:
```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Database stats
psql -U footvolley -d footvolley -c "SELECT * FROM pg_stat_statements LIMIT 10;"

# System resources
htop
```

## 🔐 Security Hardening

### Database
- [ ] Strong password for database user
- [ ] Restrict database access to localhost only
- [ ] Regular backups (daily)
- [ ] Enable WAL archiving for point-in-time recovery

### Application
- [ ] Run backend as non-root user
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS only
- [ ] Set security headers in Nginx
- [ ] Rate limiting on API endpoints
- [ ] CORS configured for specific domains

### Server
- [ ] UFW firewall enabled
- [ ] Only ports 80, 443 open
- [ ] SSH key-based authentication
- [ ] Fail2ban installed for brute-force protection
- [ ] Regular security updates

## 📈 Performance Tuning

### Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_standings_group_position ON standings(group_id, position);
CREATE INDEX idx_matches_group_status ON group_matches(group_id, status);
```

### Nginx
```nginx
# Increase worker connections
worker_connections 2048;

# Enable keepalive
keepalive_timeout 65;

# Buffer sizes
client_body_buffer_size 128k;
client_max_body_size 256M;
```

### Node.js
```bash
# Increase file descriptors
ulimit -n 65535

# Enable cluster mode with PM2
pm2 start server.js -i max --name "tournament-api"
```

## 🆘 Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs backend
# or
pm2 logs

# Verify environment variables
cat .env

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Database connection errors
```bash
# Verify PostgreSQL is running
docker-compose ps postgres
# or
sudo systemctl status postgresql

# Check database exists
psql -U footvolley -l

# Verify permissions
psql -U footvolley -d footvolley -c "SELECT 1"
```

### WebSocket not connecting
```bash
# Check Socket.io is running
curl -i http://localhost:3001/socket.io

# Check Nginx proxy config
sudo nginx -T

# View WebSocket logs
docker-compose logs backend | grep -i socket
```

### Performance issues
```bash
# Check resource usage
docker stats
# or
top
free -h
df -h

# Check database queries
psql -c "CREATE EXTENSION pg_stat_statements;"
psql -c "SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check Nginx performance
sudo ab -n 100 -c 10 http://localhost/
```

## 🚨 Disaster Recovery

### Backup Strategy
```bash
# Daily database backup
0 2 * * * docker-compose exec -T postgres pg_dump -U footvolley footvolley > /backups/footvolley_$(date +%Y%m%d).sql

# Archive to cloud storage
0 3 * * * aws s3 cp /backups/ s3://my-bucket/backups/ --recursive
```

### Restore from Backup
```bash
# Restore database from backup file
docker-compose exec -T postgres psql -U footvolley footvolley < backup.sql

# Restore application from git
cd /var/www/footvolley
git reset --hard HEAD
```

### Failover
```bash
# If primary server fails:
# 1. Restore database from backup
# 2. Deploy on secondary server
# 3. Update DNS to point to new server
# 4. Update frontend API URL
```

## ✅ Post-Deployment Verification

1. **Frontend:**
   - [ ] Loads without errors
   - [ ] Can navigate between tabs
   - [ ] Responsive on mobile
   - [ ] No console errors (F12)

2. **Backend:**
   - [ ] Health check endpoint responds
   - [ ] All API endpoints work
   - [ ] WebSocket connections work
   - [ ] Database queries execute

3. **Security:**
   - [ ] HTTPS certificate valid
   - [ ] No mixed content warnings
   - [ ] Security headers present
   - [ ] CORS configured correctly

4. **Performance:**
   - [ ] Page load time < 2 seconds
   - [ ] API response time < 500ms
   - [ ] WebSocket latency < 100ms
   - [ ] Database queries < 50ms

## 📞 Support

**Issues?** Check:
1. Application logs
2. Database connection
3. Firewall/Network settings
4. SSL certificate validity
5. Environment variables

**Escalation:**
1. Review TESTING.md for known issues
2. Check DEPLOYMENT.md for setup steps
3. Review browser console and network tab
4. Check server logs in detail
