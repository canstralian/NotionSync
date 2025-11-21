# Deployment Guide for NotionSync

This guide covers various deployment options for NotionSync in production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Replit Deployment](#replit-deployment)
  - [Docker Deployment](#docker-deployment)
  - [Traditional Server Deployment](#traditional-server-deployment)
  - [Cloud Platform Deployment](#cloud-platform-deployment)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying NotionSync, ensure you have:

1. **Notion Integration**:
   - Created a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
   - Noted your Client ID and Client Secret
   - Configured OAuth redirect URIs

2. **Database**:
   - PostgreSQL 15+ instance
   - Or a Neon Database account (recommended)

3. **Domain** (for production):
   - A domain name pointed to your server
   - SSL certificate (recommended)

## Environment Configuration

Create a `.env` file with production values:

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=5000
HOST=0.0.0.0

# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# Notion OAuth (Required)
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=https://your-domain.com/auth/notion/callback

# Session Secret (Generate a secure random string)
SESSION_SECRET=your_very_long_random_secret_string

# Optional: Logging
LOG_LEVEL=info
```

### Generating Secure Secrets

```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deployment Options

### Replit Deployment

NotionSync is optimized for Replit deployment.

#### Steps

1. **Fork the Repl**:
   - Open the project in Replit
   - Fork to your account

2. **Configure Secrets**:
   - Go to "Secrets" (lock icon in sidebar)
   - Add all environment variables:
     - `DATABASE_URL`
     - `NOTION_CLIENT_ID`
     - `NOTION_CLIENT_SECRET`
     - `NOTION_REDIRECT_URI`
     - `SESSION_SECRET`

3. **Provision Database**:
   - Use Replit's built-in PostgreSQL
   - Or connect to external Neon Database

4. **Deploy**:
   - Click "Run" button
   - Replit handles the build and deployment
   - Application will be available at your Repl URL

5. **Set up Notion Redirect**:
   - Update your Notion integration's redirect URI
   - Use: `https://your-repl-name.your-username.repl.co/auth/notion/callback`

#### Replit-Specific Features

- Automatic HTTPS
- Zero-downtime deployments
- Built-in monitoring
- Automatic restarts

### Docker Deployment

Deploy using Docker for consistent environments.

#### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

EXPOSE 5000

CMD ["npm", "start"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/notionsync
      - NOTION_CLIENT_ID=${NOTION_CLIENT_ID}
      - NOTION_CLIENT_SECRET=${NOTION_CLIENT_SECRET}
      - NOTION_REDIRECT_URI=${NOTION_REDIRECT_URI}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=notionsync
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Traditional Server Deployment

Deploy on a VPS or dedicated server.

#### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- PostgreSQL 15+ installed
- Nginx for reverse proxy
- PM2 for process management

#### Setup Steps

1. **Install Dependencies**:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx
```

2. **Clone and Setup Application**:
```bash
# Clone repository
git clone https://github.com/canstralian/NotionSync.git
cd NotionSync

# Install dependencies
npm install --legacy-peer-deps

# Set up environment
cp .env.example .env
nano .env  # Edit with your values

# Build application
npm run build

# Initialize database
npm run db:push
```

3. **Configure PM2**:

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'notionsync',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start application:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Configure Nginx**:

Create `/etc/nginx/sites-available/notionsync`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/notionsync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

5. **Setup SSL with Let's Encrypt**:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Cloud Platform Deployment

#### Heroku

1. **Create Heroku App**:
```bash
heroku create your-app-name
```

2. **Add PostgreSQL**:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. **Configure Environment**:
```bash
heroku config:set NOTION_CLIENT_ID=your_client_id
heroku config:set NOTION_CLIENT_SECRET=your_secret
heroku config:set NOTION_REDIRECT_URI=https://your-app.herokuapp.com/auth/notion/callback
heroku config:set SESSION_SECRET=your_session_secret
```

4. **Deploy**:
```bash
git push heroku main
heroku run npm run db:push
```

#### Vercel

NotionSync requires a Node.js server, so serverless platforms like Vercel would need adaptation.

#### AWS (EC2)

Follow the [Traditional Server Deployment](#traditional-server-deployment) steps on an EC2 instance.

Additional AWS-specific steps:
- Configure Security Groups for ports 80/443
- Set up Elastic IP for static IP
- Use RDS for PostgreSQL database
- Configure Application Load Balancer for scaling

#### DigitalOcean

Similar to AWS EC2, use a Droplet with the traditional deployment method.

## Database Setup

### Neon Database (Recommended)

1. **Create Account**: [neon.tech](https://neon.tech)
2. **Create Project**: Click "New Project"
3. **Get Connection String**: Copy the connection string
4. **Update .env**:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Self-Hosted PostgreSQL

1. **Create Database**:
```sql
CREATE DATABASE notionsync;
CREATE USER notionsync_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE notionsync TO notionsync_user;
```

2. **Run Migrations**:
```bash
npm run db:push
```

### Database Backups

#### Automated Backups

Create a backup script `backup.sh`:
```bash
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/notionsync"
mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Setup cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Post-Deployment

### Verification Checklist

- [ ] Application starts without errors
- [ ] Database connection successful
- [ ] OAuth flow works correctly
- [ ] All API endpoints respond
- [ ] Frontend loads properly
- [ ] Sync operations execute
- [ ] SSL certificate valid (if applicable)

### Initial Setup

1. **Access Application**: Navigate to your deployed URL
2. **Authenticate**: Complete Notion OAuth flow
3. **Configure Settings**: Set sync intervals and preferences
4. **Add Databases**: Connect your first Notion database
5. **Test Sync**: Trigger a manual sync operation

## Monitoring and Maintenance

### Health Checks

Create a health check endpoint (add to `server/routes.ts`):
```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Logging

Configure application logging:
```typescript
// Use a logging library like winston or pino
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitoring Tools

Consider integrating:
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, DataDog
- **Logs**: Papertrail, Loggly

### Regular Maintenance

- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Review and optimize database
- **Yearly**: Rotate secrets and credentials

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
pm2 logs notionsync

# Verify environment variables
printenv | grep NOTION

# Test database connection
psql $DATABASE_URL
```

#### OAuth Redirect Issues

- Verify `NOTION_REDIRECT_URI` matches Notion integration settings
- Check for HTTPS requirement in production
- Ensure no trailing slashes in URLs

#### Database Connection Errors

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart notionsync

# Consider increasing server resources
```

### Performance Optimization

1. **Database Indexing**:
```sql
CREATE INDEX idx_databases_notion_id ON notion_databases(notion_id);
CREATE INDEX idx_changes_database_id ON data_changes(database_id);
CREATE INDEX idx_operations_database_id ON sync_operations(database_id);
```

2. **Caching**: Implement Redis for session storage and caching

3. **Connection Pooling**: Configure PostgreSQL connection pool

4. **Load Balancing**: Use Nginx or cloud load balancer for multiple instances

## Security Considerations

1. **Secrets Management**:
   - Never commit `.env` to version control
   - Use environment variables or secret managers
   - Rotate credentials regularly

2. **HTTPS**:
   - Always use HTTPS in production
   - Enforce HTTPS redirects

3. **Database Security**:
   - Use strong passwords
   - Enable SSL/TLS for database connections
   - Restrict network access

4. **Rate Limiting**:
   - Implement rate limiting on API endpoints
   - Use libraries like `express-rate-limit`

5. **CORS**:
   - Configure proper CORS headers
   - Restrict to known domains

## Scaling

### Horizontal Scaling

1. **Multiple Instances**: Run multiple application instances behind a load balancer
2. **Database Connection Pool**: Use PgBouncer or similar
3. **Session Store**: Use Redis for shared sessions
4. **Caching**: Implement Redis caching layer

### Vertical Scaling

1. **Increase Server Resources**: Add more CPU/RAM
2. **Database Optimization**: Upgrade database tier
3. **SSD Storage**: Use faster storage for database

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/canstralian/NotionSync/issues)
- Review application logs
- Contact maintainers with deployment details

---

Last Updated: 2024-11-20
