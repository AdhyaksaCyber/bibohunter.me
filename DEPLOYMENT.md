# 📤 Deployment Guide - Ultron Bimbel

## 🎯 Deployment Overview

Ultron Bimbel dapat di-deploy ke beberapa target:
1. **Frontend**: Cloudflare Pages
2. **Backend API**: Cloudflare Workers
3. **Database**: Cloudflare D1
4. **Storage**: Cloudflare R2

## 📋 Pre-Deployment Checklist

- [ ] Environment variables dikonfigurasi
- [ ] Database migrations siap
- [ ] Build passes type checking
- [ ] No security vulnerabilities
- [ ] Tests passed
- [ ] README updated
- [ ] GitHub repo ready

## 🔑 Setup Cloudflare Account

### 1. Create Cloudflare Account
```bash
# Sign up di https://dash.cloudflare.com/sign-up
# Create a zone dan verifikasi domain
```

### 2. Install Wrangler CLI
```bash
npm install -g wrangler@3.27.0
wrangler login
```

### 3. Create D1 Database
```bash
# Production database
wrangler d1 create ultron-bimbel-production

# Staging database (optional)
wrangler d1 create ultron-bimbel-staging
```

Copy database_id dari output dan update `wrangler.toml`:
```toml
[env.production.d1_databases]
DB = { binding = "DB", database_name = "ultron-bimbel", database_id = "YOUR_DATABASE_ID" }
```

### 4. Create R2 Bucket
```bash
# Production storage
wrangler r2 bucket create ultron-bimbel-production

# Staging storage (optional)
wrangler r2 bucket create ultron-bimbel-staging
```

Update `wrangler.toml`:
```toml
[env.production.r2_buckets]
R2 = { binding = "R2", bucket_name = "ultron-bimbel-production" }
```

### 5. Configure Secrets
```bash
# JWT Secret (generate dengan: openssl rand -base64 32)
wrangler secret put JWT_SECRET --env production

# Database password (jika menggunakan)
wrangler secret put DATABASE_PASSWORD --env production

# API keys (jika ada)
wrangler secret put API_KEY --env production
```

Verify secrets:
```bash
wrangler secret list --env production
```

## 🚀 Deployment Steps

### Local Build & Test
```bash
# 1. Build frontend
npm run build:frontend

# 2. Build worker
npm run build:worker

# 3. Type checking
npm run typecheck

# 4. Lint
npm run lint

# 5. Preview locally
npm run preview
```

### Deploy to Cloudflare

#### Option A: Manual Deployment
```bash
# 1. Build everything
npm run build

# 2. Deploy to Cloudflare
wrangler deploy --env production

# 3. Verify deployment
curl https://ultron-bimbel.workers.dev/health
```

#### Option B: GitHub Actions (Auto-Deploy)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Deploy Frontend to Cloudflare Pages

1. Push ke GitHub:
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. Connect di Cloudflare Pages:
   - Go to Cloudflare Dashboard → Pages
   - Connect GitHub repository
   - Set build configuration:
     - **Framework**: None (Vite)
     - **Build command**: `npm run build:frontend`
     - **Build output directory**: `dist/public`
   - Set environment variables
   - Deploy

3. Setup custom domain:
   - Go to Pages project settings
   - Custom domain → Add custom domain
   - Point DNS to Cloudflare Pages

## 🗄️ Database Migration in Production

### First Time Setup
```bash
# 1. Create database
wrangler d1 create ultron-bimbel-production

# 2. Run migrations
wrangler d1 execute ultron-bimbel-production --remote < database/migrations/001_init.sql

# 3. Seed data (optional)
wrangler d1 execute ultron-bimbel-production --remote < database/seeders/seed.sql
```

### Subsequent Migrations
```bash
# 1. Generate migration
npm run build:db

# 2. Review migration file in database/migrations/

# 3. Apply migration
wrangler d1 execute ultron-bimbel-production --remote < database/migrations/002_add_column.sql

# 4. Verify
wrangler d1 execute ultron-bimbel-production --remote "SELECT * FROM sqlite_master WHERE type='table';"
```

## 🔄 Rollback Strategy

### Rollback Database Migration
```bash
# Manually revert changes
wrangler d1 execute ultron-bimbel-production --remote "DROP TABLE new_table;"

# Or restore from backup (if available)
```

### Rollback Worker Deployment
```bash
# Get previous deployment hash
wrangler deployments list

# Rollback to previous version
wrangler rollback --env production
```

## 📊 Monitoring & Logging

### View Worker Logs
```bash
wrangler tail --env production
```

### Monitor D1 Database
```bash
# Connect to database
wrangler d1 execute ultron-bimbel-production --remote "SELECT * FROM activity_logs LIMIT 10;"
```

### Check Health
```bash
curl https://ultron-bimbel.workers.dev/health
```

Response should be:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "production"
}
```

## 🔐 Security Hardening for Production

### 1. Set Security Headers
Already configured in worker middleware, but verify:
```bash
curl -I https://ultron-bimbel.workers.dev
# Should show security headers
```

### 2. Enable HTTPS
```bash
# Cloudflare automatically provides HTTPS
# Verify certificate
curl -I https://ultron-bimbel.workers.dev
```

### 3. Configure Rate Limiting
Already enabled, but adjust in `wrangler.toml`:
```toml
[env.production.vars]
RATE_LIMIT_MAX = "100"
RATE_LIMIT_WINDOW = "900000"
```

### 4. Enable API Shield
```bash
# In Cloudflare dashboard
# Security → API Shield → Create Shield
```

### 5. Setup DDoS Protection
```bash
# Cloudflare provides DDoS protection by default
# Customize in Cloudflare dashboard
```

## 📈 Performance Optimization

### 1. Enable Caching
```toml
[env.production.vars]
CACHE_TTL = "3600"
```

### 2. Cloudflare Cache Rules
```bash
# In Cloudflare dashboard
# Caching → Cache Rules
# Set rules for API endpoints and assets
```

### 3. Enable Compression
Already enabled by Cloudflare Workers.

### 4. Monitor Performance
```bash
# In Cloudflare dashboard
# Analytics → Overview
# Monitor request speed, error rates
```

## 🧪 Post-Deployment Verification

```bash
# 1. Health check
curl https://ultron-bimbel.workers.dev/health

# 2. Auth endpoint
curl -X POST https://ultron-bimbel.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test"}'

# 3. Security headers
curl -I https://ultron-bimbel.workers.dev
# Should show: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security

# 4. Frontend load
open https://ultron-bimbel.pages.dev

# 5. Rate limiting
# Send 101 requests quickly, 101st should get 429
for i in {1..101}; do curl -s https://ultron-bimbel.workers.dev/health | head -1; done
```

## 📞 Support & Troubleshooting

### Common Issues

**Issue: 502 Bad Gateway**
```bash
# Check worker logs
wrangler tail --env production

# Verify database connection
wrangler d1 execute ultron-bimbel-production --remote "SELECT 1;"
```

**Issue: Database connection error**
```bash
# Check D1 binding in wrangler.toml
# Verify database_id is correct
# Check environment variables
```

**Issue: File upload fails**
```bash
# Check R2 bucket permissions
# Verify R2_BUCKET_URL is set
# Check file size limits
```

**Issue: Slow performance**
```bash
# Enable Cloudflare cache
# Check worker execution time
# Optimize database queries
```

## 🎉 Deployment Complete!

Your Ultron Bimbel application is now live!

- **Frontend**: https://ultron-bimbel.pages.dev
- **API**: https://ultron-bimbel.workers.dev
- **Admin Dashboard**: https://ultron-bimbel.pages.dev/admin

---

**Last Updated:** 2024
**Version:** 1.0.0
