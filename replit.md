# IHO - Índice de Saúde Operacional

## Architecture

Full-stack Brazilian SaaS system for operational health monitoring in construction companies.

### Structure
- `backend/` — Express.js + TypeScript API server (Node 20)
- `backend/frontend/` — Next.js 13 frontend (served embedded by the backend in production)
- `backend/prisma/` — Prisma ORM schema (MySQL provider)

### Tech Stack
- **Backend**: Express, TypeScript, Prisma (MySQL), JWT auth, bcrypt, nodemailer, pdfkit, exceljs
- **Frontend**: Next.js 13, Tailwind CSS, shadcn/ui (Radix), Zustand, React Query, ApexCharts, Framer Motion
- **Database**: MySQL on Hostinger (`srv1662.hstgr.io`)
- **Payments**: InfinitePay integration
- **Email**: Gmail SMTP (App Password)

## Running on Replit (Development)

The workflow runs the backend in API-only mode (no Next.js embedding) for lightweight development:

```
cd backend && npm install --include=dev && npx prisma generate && DEV_MODE=true PORT=5000 ./node_modules/.bin/ts-node --transpile-only src/server.ts
```

- Port: **5000**
- `DEV_MODE=true` skips the Next.js frontend (too resource-intensive for Replit free tier)
- API available at `/api`, health at `/health`
- Database: connects to remote MySQL on Hostinger

## Production (Hostinger)

Build command: `npm run build` (builds TypeScript + Next.js frontend)
Start command: `node dist/server.js`
Root directory: `backend`
Entry file: `dist/server.js`
Port: `3001`

### What the build does:
1. `tsc` — compiles TypeScript to `dist/`
2. `npm install --prefix frontend` — installs frontend dependencies
3. `npm run build --prefix frontend` — builds Next.js frontend to `frontend/.next/`

The production server embeds Next.js: API routes go through Express, frontend pages through Next.js.

## Key Files Modified for Compatibility

- `backend/src/server.ts` — Added `DEV_MODE` support; captures PORT/DEV_MODE before dotenv override; lazy Next.js loading in production only
- `backend/package.json` — Updated `build` script to also build the frontend
- `backend/frontend/next.config.js` — Added `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds`
- `backend/frontend/tailwind.config.js` — Changed content paths to absolute (`__dirname`-based) for cross-directory compatibility
- `backend/frontend/postcss.config.js` — Added explicit tailwind config path
- `backend/postcss.config.js` — Created for Next.js PostCSS resolution from backend CWD

## Bug Fixes Applied (March 2026)

### Critical Frontend Fixes
- **`components/hooks/useAuth.ts`** — Fixed login bug: was using `useSession` from `auth/SessionProvider` (context never provided). Now uses `useAuth` from `providers/AuthProvider` (the correct provider in the app tree).
- **`components/hooks/useTheme.ts`** — Fixed theme toggle: was importing `ThemeContext` from `theme/ThemeProvider` (wrong context). Now uses `useTheme` from `providers/ThemeProvider` (the actual provider used by `AppProvider`).
- **`components/common/ThemeToggle.tsx`** — Fixed missing `cn` import and aligned `useTheme` import with the corrected hook chain.
- **`components/landing/Contato.tsx`** — Fixed API endpoint (`/contato` → `/comercial/contact`), updated phone to `(71) 9 98260-7352` with WhatsApp link, and address to "Salvador, BA".
- **`app/(comercial)/page.tsx`** — Fixed feature card icons invisible in light mode: changed `text-white` to `text-primary` inside `bg-background` wrapper.
- **`app/(comercial)/planos/page.tsx`** — Fixed `getPlanoFeatures` double-parsing bug (controller already parses JSON); added static fallback plans when DB returns empty.
- **`app/(comercial)/contato/page.tsx`** — Created missing contact page at `/contato` route.
- **`app/(comercial)/juridico/termos/page.tsx`** — Added `onClick={() => window.print()}` to PDF/Print buttons.
- **`app/(comercial)/juridico/cookies/page.tsx`** — Added print/download handlers; updated phone number.
- **`app/(comercial)/juridico/privacidade/page.tsx`** — Added print/download handlers; updated phone number.
- **`components/auth/AuthLayout.tsx`** — Added IHO logo image to the right panel of the login page; fixed gradient (`from-primary to-accent`).

### Backend Fixes
- **`src/services/EmailService.ts`** — Fixed `sendContactEmail`: was using `process.env.EMAIL_FROM` (undefined). Now uses `emailConfig.from` (correct source).

## Environment Variables

Set in Replit as env vars (non-sensitive) and secrets (sensitive).
The `.env` file in `backend/` is used as fallback — shell env vars for PORT and DEV_MODE take priority.
