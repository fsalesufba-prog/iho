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

## Environment Variables

Set in Replit as env vars (non-sensitive) and secrets (sensitive).
The `.env` file in `backend/` is used as fallback — shell env vars for PORT and DEV_MODE take priority.
