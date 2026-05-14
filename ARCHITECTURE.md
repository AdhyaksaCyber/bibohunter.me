# 🏗️ Ultron Bimbel - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER DEVICES                             │
│              (Browser, Mobile, Desktop)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTPS/WSS│
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   CLOUDFLARE EDGE NETWORK                       │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  • DDoS Protection                                      │  │
│  │  • Rate Limiting                                        │  │
│  │  • Cache (Static Assets)                                │  │
│  │  • SSL/TLS Termination                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌─────▼─────┐      ┌────▼────┐
    │ Pages   │        │ Workers   │      │ R2      │
    │(Frontend)        │ (API)     │      │(Storage)│
    └─────────┘        └─────┬─────┘      └────┬────┘
         │                   │                  │
         │            ┌──────▼──────┐          │
         │            │   Hono      │          │
         │            │   Router    │          │
         │            └──────┬──────┘          │
         │                   │                  │
    React│           ┌───────┴───────┐         │
   Vite │           │               │         │
  Build │    ┌──────▼──────┐  ┌───▼────┐    │
         │    │   Auth API  │  │ Materi │    │
         │    ├─────────────┤  ├────────┤    │
         │    │  Login      │  │ Upload │    │
         │    │  Register   │  │ List   │    │
         │    │  Refresh    │  │ Get    │    │
         │    └──────┬──────┘  └───┬────┘    │
         │           │            │          │
         │    ┌──────▼──────┐  ┌──▼────┐    │
         │    │  Tryout API │  │ User  │    │
         │    ├─────────────┤  │ Admin │    │
         │    │ List        │  │ APIs  │    │
         │    │ Start       │  └───────┘    │
         │    │ Submit      │               │
         │    └──────┬──────┘               │
         │           │                      │
         │    ┌──────▼──────────────────────┴──┐
         │    │    Database Layer              │
         │    │  (Drizzle ORM)                 │
         │    ├────────────────────────────────┤
         │    │  D1 (Production)               │
         │    │  SQLite (Development)          │
         │    └────────────────────────────────┘
         │
         └──────────── React Router
              TypeScript + TailwindCSS
              Zustand (State Management)
              React Query (Data Fetching)
```

## Data Flow Architecture

### 1. Frontend → Backend Flow
```
User Action
    ↓
React Component
    ↓
Form Validation (Zod/React Hook Form)
    ↓
Zustand Store Update
    ↓
Axios HTTP Request
    ↓
JWT Token (Authorization Header)
    ↓
Cloudflare Edge
    ↓
Rate Limiting Check
    ↓
Hono Router
    ↓
Security Middleware
    ↓
Request Validation (Zod)
    ↓
Controller Handler
    ↓
Database Query (Drizzle)
    ↓
Response Serialization
    ↓
Success/Error Response
    ↓
Frontend Toast Notification
    ↓
UI Update
```

### 2. Database Query Flow (D1/SQLite)
```
Request Handler
    ↓
DbAdapter.getDb()
    ↓
Auto-detect Environment:
├─ Production → D1Adapter (Drizzle D1)
└─ Development → SQLiteAdapter (Drizzle SQLite)
    ↓
Execute Query (Type-Safe)
    ↓
Result Mapping
    ↓
Return JSON Response
```

### 3. File Upload Flow
```
Admin Upload Modal
    ↓
File Selection + Validation
    ├─ Type check (.pdf, .docx)
    ├─ Size validation (< 50MB)
    └─ Malware scan
    ↓
FormData + Axios Upload
    ↓
Multipart/form-data
    ↓
Hono File Handler
    ↓
Security Validation
    ├─ MIME type check
    ├─ File signature check
    ├─ Virus scan (if configured)
    └─ Size recheck
    ↓
StorageAdapter.upload()
    ↓
Auto-detect Environment:
├─ Production → R2 Upload
└─ Development → Local File System
    ↓
Metadata Save to Database
    ├─ File key
    ├─ Original filename
    ├─ File size
    ├─ Upload timestamp
    └─ Uploader ID
    ↓
Success Response with File Key
    ↓
UI Updated with File URL
```

## Authentication Flow

### Login Process
```
1. User enters credentials
   ↓
2. Client-side validation (Zod)
   ↓
3. POST /api/auth/login
   {
     "username": "admin",
     "password": "hashed_in_transit"
   }
   ↓
4. Server-side validation + Anti-timing-attack delay
   ↓
5. Check rate limiting (brute force protection)
   ├─ If > MAX_LOGIN_ATTEMPT:
   │  └─ Lock account for LOCK_DURATION_SEC
   └─ If OK, continue
   ↓
6. Verify username exists
   ↓
7. bcryptjs.compare(password, hash)
   ↓
8. If match:
   ├─ Generate JWT token (expires in JWT_EXPIRES_IN)
   ├─ Generate refresh token
   ├─ Store session in database
   └─ Return tokens + user data
   ↓
9. If no match:
   ├─ Increment failed attempts
   └─ Return generic error (not "user not found")
   ↓
10. Client stores tokens:
    ├─ Access token → Memory (Zustand store)
    ├─ Refresh token → localStorage (secure)
    └─ User data → Zustand store
    ↓
11. Setup axios interceptor:
    └─ Attach JWT to all requests
        Authorization: Bearer {token}
    ↓
12. Redirect to dashboard
```

### Token Refresh Flow
```
1. Access token expires (typically 15 minutes)
   ↓
2. API returns 401 Unauthorized
   ↓
3. Axios interceptor catches 401
   ↓
4. POST /api/auth/refresh
   {
     "refreshToken": "refresh_token_value"
   }
   ↓
5. Server validates refresh token
   ├─ Check signature
   ├─ Check expiry
   ├─ Check in database (not revoked)
   └─ Check user status (not suspended)
   ↓
6. If valid:
   ├─ Generate new access token
   ├─ Optionally rotate refresh token
   └─ Update session in database
   ↓
7. Return new access token
   ↓
8. Axios interceptor retries original request
   with new access token
   ↓
9. Request succeeds
```

### Logout Process
```
1. User clicks logout
   ↓
2. POST /api/auth/logout
   ↓
3. Server invalidates session:
   ├─ Mark session as revoked
   ├─ Add tokens to blacklist
   └─ Log activity
   ↓
4. Client clears state:
   ├─ Remove tokens from memory
   ├─ Clear localStorage
   ├─ Remove axios authorization header
   └─ Zustand store reset
   ↓
5. Redirect to home page
```

## Security Layers

### Layer 1: Network Security
- ✅ HTTPS/TLS encryption
- ✅ Cloudflare DDoS protection
- ✅ Secure headers (HSTS, CSP, X-Frame-Options)
- ✅ API Shield (rate limiting)

### Layer 2: Authentication & Authorization
- ✅ JWT with HS256 signature
- ✅ Refresh token rotation
- ✅ Session tracking in database
- ✅ RBAC (Role-Based Access Control)
- ✅ Permission middleware checks

### Layer 3: Input Validation
- ✅ Schema validation with Zod
- ✅ Type checking (TypeScript)
- ✅ Length/format validation
- ✅ File type/extension validation
- ✅ SQL injection prevention (parameterized queries)

### Layer 4: Data Protection
- ✅ Password hashing (bcryptjs, 12 rounds)
- ✅ HTML sanitization (DOMPurify + sanitize-html)
- ✅ XSS protection (Content Security Policy)
- ✅ CSRF tokens (if needed)
- ✅ Sensitive data masking in logs

### Layer 5: Rate Limiting & Throttling
- ✅ Login attempt limiting
- ✅ API rate limiting
- ✅ IP-based throttling
- ✅ DDoS mitigation

### Layer 6: Audit & Monitoring
- ✅ Activity logging (all important actions)
- ✅ Error logging with context
- ✅ Request tracing (requestId)
- ✅ Security event alerts

## Component Architecture

### Frontend Components Structure
```
src/components/
├── Common (Reusable)
│   ├── Navbar.tsx          # Navigation bar
│   ├── Footer.tsx          # Footer
│   ├── ProtectedRoute.tsx  # Route guard
│   └── TawkChat.tsx        # Live chat
│
├── Admin
│   └── AdminNavbar.tsx     # Admin panel header
│
└── Features
    ├── PDF Viewer         # pdfjs-dist integration
    ├── Word Parser        # Mammoth integration
    ├── Tryout Builder     # Create tryout
    ├── Material Uploader  # Upload materi
    └── Progress Tracker   # User stats

src/layouts/
├── MainLayout.tsx         # Default layout
├── AuthLayout.tsx         # Login/register layout
└── AdminLayout.tsx        # Admin panel layout

src/pages/
├── HomePage.tsx           # Landing page
├── LoginPage.tsx          # Login
├── RegisterPage.tsx       # Register
├── DashboardPage.tsx      # User dashboard
├── MateriPage.tsx         # Materi list
├── TryoutListPage.tsx     # Tryout list
├── admin/
│   ├── AdminDashboard.tsx
│   ├── AdminUsers.tsx
│   ├── AdminMateri.tsx
│   └── AdminTryout.tsx
```

### Backend Routes Structure
```
worker/
└── routes/
    ├── auth.ts
    │   ├── POST /login
    │   ├── POST /register
    │   ├── POST /refresh
    │   ├── POST /logout
    │   └── GET /verify
    │
    ├── materi.ts
    │   ├── GET /list
    │   ├── GET /:id
    │   ├── GET /download/:fileKey
    │   └── POST /upload
    │
    ├── tryout.ts
    │   ├── GET /list
    │   ├── GET /:id
    │   ├── POST /:id/start
    │   ├── POST /:id/submit
    │   ├── GET /:id/hasil
    │   ├── POST /create
    │   └── POST /:id/upload-soal
    │
    ├── user.ts
    │   ├── GET /profile
    │   ├── PUT /profile
    │   ├── POST /change-password
    │   ├── GET /progress
    │   ├── GET /history
    │   └── GET /leaderboard
    │
    └── admin.ts
        ├── GET /users
        ├── POST /users
        ├── PUT /users/:id
        ├── DELETE /users/:id
        ├── GET /materi
        ├── POST /materi/:id/publish
        ├── GET /tryout
        ├── POST /tryout/:id/publish
        └── GET /stats
```

## Database Schema Architecture

### Users & Auth
```sql
users (id, username, email, passwordHash, roleId, ...)
roles (id, name, description)
permissions (id, name, description)
role_permissions (roleId, permissionId)
sessions (id, userId, token, refreshToken, expiresAt, ...)
```

### Content
```sql
kategori (id, name, slug, description, ...)
materi (id, title, categoryId, fileKey, uploadedBy, status, ...)
artikel (id, title, slug, content, createdBy, status, ...)
```

### Tryout System
```sql
tryout (id, title, durationMinutes, totalSoal, ...)
soal (id, tryoutId, pertanyaan, opsiA-E, jawabanBenar, ...)
hasil_tryout (userId, tryoutId, skor, persentase, status, ...)
jawaban_soal (hasilTryoutId, soalId, jawabanUser, isCorrect, ...)
```

### System
```sql
uploads (id, fileKey, uploadedBy, entityType, status, ...)
activity_logs (id, userId, action, details, timestamp, ...)
settings (id, key, value, dataType)
```

## State Management Strategy

### Zustand Stores
```typescript
// Auth Store
useAuthStore()
├─ isAuthenticated: boolean
├─ user: User | null
├─ accessToken: string
├─ refreshToken: string
├─ login()
├─ logout()
├─ checkAuth()
└─ refreshAccessToken()

// Additional stores as needed
useMateriStore()      // Materi state
useTryoutStore()      // Tryout state
useUserStore()        // User profile state
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "..."
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error details"
  }
}
```

## Environment Detection Pattern

The app uses an adapter pattern for environment detection:

```typescript
// Database
if (env.DB) {
  // Production: D1
  db = new D1Adapter(env.DB);
} else {
  // Development: SQLite
  db = new SQLiteAdapter();
}

// Storage
if (env.R2) {
  // Production: R2
  storage = new R2StorageAdapter(env.R2);
} else {
  // Development: Local FS
  storage = new LocalStorageAdapter();
}
```

## Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization with lazy loading
- CSS module scoping
- Tree-shaking with Vite
- Gzip compression

### Backend
- Database query optimization (indexes)
- Response caching headers
- API pagination
- Connection pooling
- Request compression

### Cloudflare
- Edge caching
- Image optimization
- Automatic minification
- HTTP/2 Server Push

---

**Last Updated:** 2024
**Version:** 1.0.0
