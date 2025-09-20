# 🚀 NAMASTE Deployment Guide

## Overview

This guide covers the complete deployment process for the NAMASTE Traditional Medicine EHR System, including both development and production environments.

---

## 📋 Prerequisites

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: Minimum 10GB free space
- **Network**: Internet connection for API calls

### Software Requirements
- **Node.js**: 18.0+ and npm 8.0+
- **Python**: 3.11+
- **Git**: 2.30+
- **Docker**: 20.10+ (optional)

### API Credentials Required
- **WHO ICD-11 API**: Client ID and Secret
- **Google Gemini AI**: API Key
- **Firebase**: Project credentials (optional)

---

## 🛠️ Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/namaste-ehr.git
cd namaste-ehr
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment
```bash
# Run setup script
python setup_env.py

# Or manually create .env file
cp .env.example .env
# Edit .env with your credentials
```

#### Environment Variables
```env
# WHO ICD-11 API
WHO_ICD11_CLIENT_ID=your_client_id
WHO_ICD11_CLIENT_SECRET=your_client_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your_secret_key

# Database (Optional)
DATABASE_URL=sqlite:///namaste.db
```

#### Start Backend Server
```bash
python app.py
```

Backend will be available at: `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment
```bash
# Create .env file
cp .env.example .env.local
# Edit .env.local with your configuration
```

#### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=NAMASTE EHR
VITE_APP_VERSION=1.0.0
```

#### Start Development Server
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🐳 Docker Deployment

### 1. Docker Compose Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - WHO_ICD11_CLIENT_ID=${WHO_ICD11_CLIENT_ID}
      - WHO_ICD11_CLIENT_SECRET=${WHO_ICD11_CLIENT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./backend/resources:/app/resources
    depends_on:
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

### 2. Dockerfile for Backend

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

### 3. Dockerfile for Frontend

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4. Deploy with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup
```bash
# Launch EC2 instance (t3.medium or larger)
# Install dependencies
sudo apt update
sudo apt install python3.11 python3-pip nodejs npm nginx

# Clone repository
git clone https://github.com/your-org/namaste-ehr.git
cd namaste-ehr
```

#### 2. Backend Deployment
```bash
cd backend
pip3 install -r requirements.txt
python3 setup_env.py

# Create systemd service
sudo nano /etc/systemd/system/namaste-backend.service
```

Service file:
```ini
[Unit]
Description=NAMASTE Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/namaste-ehr/backend
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable namaste-backend
sudo systemctl start namaste-backend
```

#### 3. Frontend Deployment
```bash
cd frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/namaste
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /home/ubuntu/namaste-ehr/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/namaste /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Azure Deployment

#### 1. Azure App Service
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name namaste-rg --location eastus

# Create App Service plan
az appservice plan create --name namaste-plan --resource-group namaste-rg --sku B1

# Create web app for backend
az webapp create --resource-group namaste-rg --plan namaste-plan --name namaste-backend --runtime "PYTHON|3.11"

# Deploy backend
az webapp deployment source config --name namaste-backend --resource-group namaste-rg --repo-url https://github.com/your-org/namaste-ehr.git --branch main --manual-integration
```

#### 2. Environment Variables
```bash
# Set environment variables
az webapp config appsettings set --resource-group namaste-rg --name namaste-backend --settings WHO_ICD11_CLIENT_ID="your_client_id"
az webapp config appsettings set --resource-group namaste-rg --name namaste-backend --settings WHO_ICD11_CLIENT_SECRET="your_client_secret"
az webapp config appsettings set --resource-group namaste-rg --name namaste-backend --settings GEMINI_API_KEY="your_gemini_key"
```

---

## 🔧 Production Configuration

### 1. Environment Variables

Create `.env.production`:
```env
# Production Environment
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your_production_secret_key

# API Credentials
WHO_ICD11_CLIENT_ID=your_production_client_id
WHO_ICD11_CLIENT_SECRET=your_production_client_secret
GEMINI_API_KEY=your_production_gemini_key

# Database
DATABASE_URL=postgresql://user:password@localhost/namaste_prod

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
CORS_ORIGINS=https://your-domain.com
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

### 2. Security Configuration

#### SSL/TLS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Firewall Configuration
```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Monitoring Setup

#### Application Monitoring
```bash
# Install monitoring tools
pip install psutil prometheus-client

# Create monitoring script
nano monitor.py
```

```python
import psutil
import time
from prometheus_client import start_http_server, Gauge

# Metrics
cpu_usage = Gauge('cpu_usage_percent', 'CPU usage percentage')
memory_usage = Gauge('memory_usage_percent', 'Memory usage percentage')
disk_usage = Gauge('disk_usage_percent', 'Disk usage percentage')

def collect_metrics():
    while True:
        cpu_usage.set(psutil.cpu_percent())
        memory_usage.set(psutil.virtual_memory().percent)
        disk_usage.set(psutil.disk_usage('/').percent)
        time.sleep(60)

if __name__ == '__main__':
    start_http_server(8000)
    collect_metrics()
```

#### Log Management
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/namaste
```

```
/home/ubuntu/namaste-ehr/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
```

---

## 📊 Performance Optimization

### 1. Database Optimization

#### PostgreSQL Setup
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb namaste_prod

# Create user
sudo -u postgres createuser namaste_user
sudo -u postgres psql -c "ALTER USER namaste_user PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE namaste_prod TO namaste_user;"
```

#### Database Configuration
```sql
-- Optimize PostgreSQL
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
SELECT pg_reload_conf();
```

### 2. Caching Setup

#### Redis Configuration
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
```

```
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Load Balancing

#### Nginx Load Balancer
```nginx
upstream backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Backend Not Starting
```bash
# Check logs
sudo journalctl -u namaste-backend -f

# Check port availability
sudo netstat -tlnp | grep :5000

# Restart service
sudo systemctl restart namaste-backend
```

#### 2. Frontend Build Issues
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

#### 3. API Connection Issues
```bash
# Test API endpoints
curl -X GET http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/namaste/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

#### 4. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Check connection
psql -h localhost -U namaste_user -d namaste_prod
```

### Performance Issues

#### 1. High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Optimize Python memory
export PYTHONHASHSEED=0
export PYTHONUNBUFFERED=1
```

#### 2. Slow API Responses
```bash
# Check database queries
sudo -u postgres psql -d namaste_prod -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check Redis performance
redis-cli info stats
```

---

## 📈 Monitoring & Maintenance

### 1. Health Checks

#### Automated Health Monitoring
```bash
# Create health check script
nano health_check.sh
```

```bash
#!/bin/bash
# Health check script

# Check backend
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "Backend: OK"
else
    echo "Backend: FAILED"
    # Send alert
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "Frontend: OK"
else
    echo "Frontend: FAILED"
    # Send alert
fi

# Check database
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "Database: OK"
else
    echo "Database: FAILED"
    # Send alert
fi
```

```bash
chmod +x health_check.sh

# Add to crontab
crontab -e
# Add: */5 * * * * /path/to/health_check.sh
```

### 2. Backup Strategy

#### Database Backup
```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump namaste_prod > $BACKUP_DIR/namaste_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/namaste_app_$DATE.tar.gz /home/ubuntu/namaste-ehr

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 3. Updates & Maintenance

#### Update Process
```bash
# Create update script
nano update.sh
```

```bash
#!/bin/bash
# Update script

# Backup current version
./backup.sh

# Pull latest changes
cd /home/ubuntu/namaste-ehr
git pull origin main

# Update backend
cd backend
pip install -r requirements.txt

# Update frontend
cd ../frontend
npm install
npm run build

# Restart services
sudo systemctl restart namaste-backend
sudo systemctl reload nginx

echo "Update completed successfully"
```

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] API credentials valid and tested
- [ ] Database schema created
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] Firewall rules configured

### Deployment
- [ ] Backend service running
- [ ] Frontend build successful
- [ ] Database connections working
- [ ] API endpoints responding
- [ ] SSL/TLS configured
- [ ] Monitoring setup

### Post-Deployment
- [ ] Health checks passing
- [ ] Performance monitoring active
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] Security updates applied
- [ ] Documentation updated

---

## 📞 Support

For deployment support:
- **Email**: deployment@namaste-ehr.com
- **Documentation**: [Deployment Docs](https://docs.namaste-ehr.com/deployment)
- **Issues**: [GitHub Issues](https://github.com/your-org/namaste-ehr/issues)

---

This comprehensive deployment guide ensures successful deployment of the NAMASTE system in any environment, from development to production.
