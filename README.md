# Ultron Bimbel - Platform Bimbingan CPNS Modern

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js->=18.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

Platform bimbingan belajar CPNS modern premium production-ready dengan teknologi terdepan.

## 🚀 Features

- ✅ **Modern Full-Stack Architecture** - React + Hono + Cloudflare Workers
- ✅ **Hybrid Environment** - SQLite untuk development, D1 untuk production
- ✅ **Real Backend Auth** - JWT + bcrypt dengan session management
- ✅ **Material Management** - Upload dan parsing PDF untuk materi pembelajaran
- ✅ **Tryout System** - Sistem ujian online dengan grading otomatis dan pembahasan
- ✅ **Word Parser** - Import soal dari file Word (.docx) menggunakan Mammoth
- ✅ **PDF Viewer** - Viewer PDF modern dengan pagination dan search
- ✅ **Admin Panel** - Management sistem lengkap dengan RBAC
- ✅ **User Dashboard** - Progress tracking dan analytics personal
- ✅ **Security Hardening** - OWASP Top 10 mitigation + secure headers
- ✅ **Rate Limiting** - Brute force protection dan DDoS mitigation
- ✅ **Live Chat** - Tawk.to integration untuk customer support
- ✅ **Production Ready** - Zero security vulnerabilities, optimized performance

## 📋 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool (lightning fast)
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Data fetching & caching
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **Axios** - HTTP client
- **pdfjs-dist** - PDF viewer
- **Mammoth** - Word document parser
- **Lucide React** - Icons
- **DOMPurify** - HTML sanitization

### Backend
- **Cloudflare Workers** - Serverless runtime
- **Hono** - Lightweight web framework
- **Drizzle ORM** - Type-safe database access
- **JWT (jose)** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Request validation
- **Pino** - Logging

### Database & Storage
- **SQLite** - Local development
- **Cloudflare D1** - Production database
- **Cloudflare R2** - File storage (production)
- **Local File Storage** - Development files

### Security & Hardening
- Strict CORS configuration
- Secure headers (CSP, HSTS, X-Frame-Options)
- Input validation & sanitization
- Rate limiting & brute force protection
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure password hashing
- Session management
- Audit logging

## 🛠️ Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm atau yarn
- Git
- Wrangler CLI (`npm install -g wrangler`)

### Local Development Setup

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/ultron-bimbel.git
cd ultron-bimbel
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` dan set variables sesuai kebutuhan:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="900"

# Auth
MAX_LOGIN_ATTEMPT="5"
PASSWORD_MIN_LENGTH="8"

# Upload
MAX_UPLOAD_SIZE="52428800"

# Other configs
ENVIRONMENT="development"
```

4. **Generate Secret Keys**
```bash
# Generate JWT secret
openssl rand -base64 32
```

5. **Setup Database (Local)**
```bash
# Generate migrations
npm run build:db

# Migrate local database
npm run migrate:local

# Seed sample data
npm run seed:local
```

6. **Start Development Server**
```bash
# Full stack (frontend + backend)
npm run dev

# Atau separate terminals:
npm run dev:frontend      # Terminal 1
npm run dev:worker        # Terminal 2
```

Frontend: http://localhost:5173
Backend: http://localhost:8787

### Available Scripts

```bash
# Development
npm run dev              # Start full stack development
npm run dev:frontend    # Start frontend only (Vite)
npm run dev:worker      # Start backend only (Wrangler)

# Building
npm run build           # Build frontend + worker
npm run build:frontend # Build React app
npm run build:worker   # Build Cloudflare Worker

# Database
npm run build:db       # Generate migrations
npm run migrate:local  # Run local migrations
npm run seed:local     # Seed local database
npm run db:studio      # Open Drizzle Studio

# Validation
npm run typecheck      # TypeScript type checking
npm run lint          # ESLint

# Production
npm run preview       # Preview production build locally
npm run deploy        # Deploy to Cloudflare
```

## 📦 Project Structure

```
ultron-bimbel/
├── src/                          # Frontend React app
│   ├── components/              # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── TawkChat.tsx
│   │   └── ...
│   ├── layouts/                 # Layout components
│   │   ├── MainLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── AdminLayout.tsx
│   ├── pages/                   # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MateriPage.tsx
│   │   ├── TryoutListPage.tsx
│   │   └── admin/
│   ├── store/                   # Zustand stores
│   │   └── authStore.ts
│   ├── utils/                   # Utilities
│   │   └── security.ts          # JWT, bcrypt, validation, etc.
│   ├── styles/                  # CSS files
│   │   └── index.css
│   ├── App.tsx                  # Main app component
│   ├── index.tsx                # Entry point
│   └── index.css
│
├── worker/                      # Cloudflare Worker backend
│   ├── index.ts                # Main worker file
│   └── routes/                 # API routes
│       ├── auth.ts
│       ├── materi.ts
│       ├── tryout.ts
│       ├── user.ts
│       └── admin.ts
│
├── database/                    # Database layer
│   ├── schema.ts               # Drizzle schema definition
│   ├── adapter.ts              # DB adapter pattern
│   ├── storage.ts              # Storage adapter pattern
│   ├── migrations/             # Auto-generated migrations
│   └── seeders/                # Database seeders
│
├── public/                      # Static assets
├── tests/                       # Test files
├── scripts/                     # Utility scripts
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── wrangler.toml                # Cloudflare configuration
├── drizzle.config.ts            # Drizzle configuration
├── .env.example                 # Environment template
├── .gitignore
└── README.md
```

## 🔐 Security Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Secure password hashing (bcryptjs)
- ✅ Refresh token rotation
- ✅ Session management
- ✅ RBAC (Role-Based Access Control)
- ✅ Brute force protection

### Input & Data Validation
- ✅ Zod schema validation on all endpoints
- ✅ HTML sanitization (DOMPurify + sanitize-html)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ File upload validation (type, size, extension)

### Transport Security
- ✅ HTTPS only (production)
- ✅ Secure headers (CSP, HSTS, X-Frame-Options)
- ✅ CORS properly configured
- ✅ Rate limiting & IP throttling

### Rate Limiting Parameters
```env
MAX_LOGIN_ATTEMPT="5"           # Max login attempts
LOCK_DURATION_SEC="60"          # Lockout duration
RATE_LIMIT_WINDOW="900"         # Rate limit window (ms)
RATE_LIMIT_MAX="100"            # Max requests per window
MAX_REQUEST_SIZE="5242880"      # 5MB max request size
MAX_UPLOAD_SIZE="52428800"      # 50MB max upload size
```

## 🚀 Deployment

### Deploy to Cloudflare

1. **Create Cloudflare Account**
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Create a new zone

2. **Setup Wrangler**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **Create D1 Database (Production)**
   ```bash
   wrangler d1 create ultron-bimbel-production
   ```

4. **Create R2 Bucket (Production)**
   ```bash
   wrangler r2 bucket create ultron-bimbel-production
   ```

5. **Update wrangler.toml**
   ```toml
   [env.production.d1_databases]
   DB = { binding = "DB", database_name = "ultron-bimbel", database_id = "YOUR_ID" }

   [env.production.r2_buckets]
   R2 = { binding = "R2", bucket_name = "ultron-bimbel-production" }
   ```

6. **Set Production Secrets**
   ```bash
   wrangler secret put JWT_SECRET --env production
   ```

7. **Build & Deploy**
   ```bash
   npm run build
   wrangler deploy --env production
   ```

### Deploy Frontend to Cloudflare Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to Cloudflare Pages
   - Connect your GitHub repo
   - Set build command: `npm run build:frontend`
   - Set publish directory: `dist/public`

3. **Deploy**
   - Automatic deployment on git push
   - Production at `https://ultron-bimbel.pages.dev`

## 📊 Environment Variables

### Development (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-key"
ENVIRONMENT="development"
API_URL="http://localhost:8787"
FRONTEND_URL="http://localhost:5173"
```

### Production (Wrangler Secrets)
```bash
wrangler secret put JWT_SECRET --env production
wrangler secret put DATABASE_PASSWORD --env production
# Other secrets...
```

## 🧪 Testing

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Manual Testing Checklist
- [ ] Login flow
- [ ] Upload materi (PDF)
- [ ] Parse soal dari Word
- [ ] Tryout submission
- [ ] PDF viewer
- [ ] Admin panel
- [ ] Rate limiting
- [ ] Security headers

## 📱 Browser Support

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- Mobile browsers (iOS Safari >= 14, Chrome Mobile >= 90)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## ✨ Credits

Developed with ❤️ for CPNS aspirants by Ultron Bimbel Team.

---

**Last Updated:** 2024
**Version:** 1.0.0
