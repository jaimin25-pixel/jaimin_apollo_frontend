# Apollo HMS - Frontend

## Project Overview
Hospital Management System (HMS) frontend built with **Vue.js 3**, **TypeScript**, **Pinia**, and **Vite**.

## Tech Stack
- **Framework:** Vue 3 (Composition API + `<script setup>`)
- **Language:** TypeScript
- **State Management:** Pinia (setup stores)
- **Build Tool:** Vite
- **HTTP Client:** Axios (with JWT interceptor)
- **Encryption:** Web Crypto API (AES-256-GCM)
- **Routing:** Vue Router 4 (lazy loading, navigation guards)

## Architecture
```
jaimin_apollo_frontend/
├── public/
│   ├── apollo-logo.png         # Apollo hospital logo
│   └── hospital-corridor.jpg   # Login page background image
├── src/
│   ├── api/
│   │   ├── axios.ts            # Axios instance, baseURL /api, JWT interceptor, 401 auto-logout
│   │   └── auth.ts             # login(), register(), getMe(), forgotPassword(), verifyCode(), resetPassword()
│   ├── stores/
│   │   └── auth.ts             # Pinia setup store — user, tokens, login/register/logout/checkAuth actions, AES encrypt
│   ├── utils/
│   │   ├── crypto.ts           # AES-256-GCM encryption (Web Crypto API), key fetch & cache from backend
│   │   └── validators.ts       # Shared validators + passwordStrength(0-4 score with color/label)
│   ├── types/
│   │   └── index.ts            # User, DoctorProfile, PatientProfile, PharmacistProfile, AdminProfile, TokenPair, API types
│   ├── views/
│   │   ├── LoginView.vue           # 60/40 split layout, 4 role selector cards, dynamic Create Account link, password strength bar
│   │   ├── RegisterDoctorView.vue  # Doctor registration — license, specialization, phone
│   │   ├── RegisterPatientView.vue # Patient registration — DOB, gender, insurance
│   │   ├── RegisterPharmacistView.vue # Pharmacist registration — license, branch location, compliance checkbox
│   │   ├── RegisterAdminView.vue   # Admin registration — employee ID, department, access key, stricter validation
│   │   ├── ForgotPasswordView.vue  # Email input → stores in sessionStorage, shows OTP in dev mode
│   │   ├── VerifyCodeView.vue      # 6 individual digit inputs with auto-advance, resend timer
│   │   └── ResetPasswordView.vue   # Password requirements checker (4 items), AES encrypt before API call
│   ├── router/
│   │   └── index.ts            # All routes with lazy loading, requiresGuest/requiresAuth guards
│   ├── App.vue                 # Root component
│   └── main.ts                 # App entry point
├── vite.config.ts              # Vite config with /api proxy to localhost:8080
├── tsconfig.json
└── package.json
```

## Pages & Routes
| Route | View | Guard | Description |
|-------|------|-------|-------------|
| `/login` | LoginView | Guest | Login with role selector (doctor/patient/pharmacist/admin) |
| `/register/doctor` | RegisterDoctorView | Guest | Doctor registration form |
| `/register/patient` | RegisterPatientView | Guest | Patient registration form |
| `/register/pharmacist` | RegisterPharmacistView | Guest | Pharmacist registration form |
| `/register/admin` | RegisterAdminView | Guest | Admin registration form |
| `/forgot-password` | ForgotPasswordView | Guest | Enter email for password reset |
| `/verify-code` | VerifyCodeView | Guest | Enter 6-digit OTP code |
| `/reset-password` | ResetPasswordView | Guest | Set new password |
| `/dashboard` | (placeholder) | Auth | Post-login redirect |

## Key Features
- **Dynamic role routing** — "Create Account" link on login follows selected role (`/register/doctor`, etc.)
- **AES-256-GCM encryption** — Passwords encrypted via Web Crypto API before sending to backend
- **JWT token management** — Access + refresh tokens in localStorage, auto-inject via Axios interceptor
- **Auto-logout** — 401 responses trigger automatic logout and redirect to login
- **Password strength meter** — 0-4 score with visual color bar (red → green) and labels
- **Advanced validation** — Email, password (8+ chars, upper, lower, number, special), phone, license, DOB, etc.
- **OTP flow** — 6 individual digit inputs with auto-advance/backspace, resend timer (60s countdown)
- **SessionStorage** — Forgot password flow persists email/code across pages

## Validators (`src/utils/validators.ts`)
| Validator | Rules |
|-----------|-------|
| `email` | Valid email format |
| `password` | 8+ chars, uppercase, lowercase, number, special character |
| `loginPassword` | 6+ chars (simpler for login) |
| `fullName` | 2+ chars, letters only |
| `licenseNumber` | Alphanumeric with hyphens |
| `employeeId` | Alphanumeric with hyphens |
| `phone` | 10+ digits |
| `insuranceId` | Alphanumeric |
| `dateOfBirth` | Valid date, not in future |
| `adminPassword` | 12+ chars, stricter rules |
| `accessKey` | Required, non-empty |
| `passwordStrength` | Returns score 0-4, color, label |

## API Integration
All API calls go through `src/api/axios.ts` → Vite proxy `/api` → `http://localhost:8080`

| Function | Method | Endpoint |
|----------|--------|----------|
| `login()` | POST | `/api/auth/login` |
| `register()` | POST | `/api/auth/register` |
| `getMe()` | GET | `/api/auth/me` |
| `forgotPassword()` | POST | `/api/auth/forgot-password` |
| `verifyCode()` | POST | `/api/auth/verify-code` |
| `resetPassword()` | POST | `/api/auth/reset-password` |

## Commands
```bash
# Install dependencies
npm install

# Dev server (port 3000)
npm run dev

# Build for production
npm run build

# Type check
npx vue-tsc --noEmit
```

Dev server runs on `http://localhost:3000`

## Design
- **Login page:** 60/40 split — left form panel with role selector cards, right panel with hospital corridor background
- **Registration pages:** Modern card-based forms with role-specific fields and branding
- **Pharmacist page:** Stats bar (24/7 availability, 100% compliance), compliance checkbox
- **Forgot password flow:** 3-step wizard (email → OTP → reset) with smooth transitions
- **Color scheme:** Apollo Hospital blue/teal theme

---

## Task Log — 2026-03-26

### AP-01: Authentication System (Full Build)

| # | Task | Status |
|---|------|--------|
| 1 | Project scaffolding — Vue 3 + TypeScript + Vite + Pinia + Vue Router | Done |
| 2 | TypeScript types — User, DoctorProfile, PatientProfile, PharmacistProfile, AdminProfile, TokenPair, API types | Done |
| 3 | Axios instance with baseURL `/api`, JWT interceptor, 401 auto-logout | Done |
| 4 | Auth API module — login, register, getMe, forgotPassword, verifyCode, resetPassword | Done |
| 5 | Pinia auth store — user state, token management, login/register/logout/checkAuth actions | Done |
| 6 | Vue Router with lazy-loaded routes, requiresGuest/requiresAuth navigation guards | Done |
| 7 | LoginView — 60/40 split layout, hospital corridor background, Apollo logo | Done |
| 8 | LoginView — 4 role selector cards (doctor/patient/pharmacist/admin) with dynamic Create Account link | Done |
| 9 | RegisterDoctorView — Doctor form with license number, specialization, phone | Done |
| 10 | RegisterPatientView — Patient form with DOB, gender, blood group, insurance | Done |
| 11 | RegisterPharmacistView — Pharmacist form with license, branch location, stats bar, compliance checkbox | Done |
| 12 | RegisterAdminView — Admin form with employee ID, department, access key, stricter validation | Done |
| 13 | ForgotPasswordView — Email input, sessionStorage persistence, dev mode OTP display | Done |
| 14 | VerifyCodeView — 6 individual digit inputs with auto-advance, paste support, resend timer | Done |
| 15 | ResetPasswordView — New password with 4-item requirements checker, AES encryption | Done |
| 16 | Dynamic role routing — Create Account link follows selected role on login page | Done |
| 17 | All frontend forms connected to backend APIs with proper error handling | Done |
| 18 | Response shape alignment — tokens.access_token, snake_case fields, error key matching | Done |
| 19 | AES-256-GCM encryption utility — Web Crypto API, key fetch from backend, CryptoKey cache | Done |
| 20 | Shared validators utility — email, password, phone, license, DOB, admin password, access key | Done |
| 21 | Password strength meter — 0-4 score with color gradient and labels | Done |
| 22 | All views updated with advanced validation and password strength bars | Done |
| 23 | Pinia store updated to encrypt passwords before API calls | Done |
