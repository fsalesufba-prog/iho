# IHO - Índice de Saúde Operacional

A comprehensive SaaS platform for managing the operational health of heavy machinery and equipment fleets. Includes maintenance tracking, fuel consumption, financial analytics, and reporting.

## Architecture

- **Frontend**: Next.js 13 (App Router) on port 5000, TypeScript, Tailwind CSS, Radix UI, TanStack Query
- **Backend**: Express + TypeScript on port 3001, Prisma ORM, PostgreSQL

## Workflows

- **Start application** — runs `npm run dev` in `/frontend`, serves on port 5000
- **Backend API** — runs `npm run dev` in `/backend`, serves on port 3001

## Database

- Uses Replit PostgreSQL (provisioned via DATABASE_URL env var)
- Prisma ORM with migrations in `backend/prisma/migrations/`
- Run `cd backend && npx prisma migrate dev` to apply new migrations
- Run `cd backend && npx prisma generate` to regenerate the client after schema changes

## Key Directories

- `frontend/src/app` — Next.js App Router pages
- `frontend/src/components` — Reusable UI components
- `backend/src/controllers` — Express route handlers
- `backend/src/services` — Business logic
- `backend/src/routes` — API routes
- `backend/prisma/schema.prisma` — Database schema

## Environment Variables

All environment variables are set in Replit's secrets/env panel:
- `DATABASE_URL` — PostgreSQL connection string (managed by Replit)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — Auth tokens
- `NEXT_PUBLIC_API_URL` — Frontend API endpoint pointing to backend
- `PORT=3001` — Backend port
- See `backend/.env.example` for full list

<<<<<<< HEAD
## Hostinger Deployment (Servidor Unificado)

A pasta raiz contém um servidor unificado que serve frontend e backend na mesma porta:

- **`server.js`** — Entry point para produção: combina Next.js + Express numa única porta
- **`package.json`** — Scripts de build/start para o Hostinger

### Como fazer o deploy no Hostinger

1. **Enviar código** (git push ou upload direto)
2. **Variáveis de ambiente** no painel Hostinger:
   - `DATABASE_URL` — PostgreSQL da produção (MySQL/PG Hostinger ou externo)
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — Copiar do `backend/.env`
   - `NODE_ENV=production`
   - `PORT` — normalmente definido automaticamente pelo Hostinger
   - `FRONTEND_URL=https://SEU_DOMINIO.com` — para CORS
   - As demais vars do `backend/.env` (SMTP, InfinitePay, etc.)
3. **Instalar dependências** (painel ou SSH):
   ```
   npm run install:all
   ```
4. **Buildar** (painel ou SSH):
   ```
   npm run build
   ```
5. **Startup command** no painel Hostinger:
   ```
   npm start
   ```
   ou `node server.js`

### Como funciona

- Requisições `/api/*` → Express backend  
- Requisições `/health` → Express health check  
- Tudo o mais → Next.js (SSR + páginas estáticas)
- Não precisa configurar `NEXT_PUBLIC_API_URL` — o sistema detecta automaticamente

---

=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
## Migration Notes (Replit Import - Session 3)

- Backend `.env` updated: removed MySQL `DATABASE_URL` override so Replit's PostgreSQL env var takes precedence
- Prisma schema updated from `mysql` to `postgresql` provider
- Both `npm install` runs completed for `/backend` and `/frontend`
- Prisma client regenerated for PostgreSQL
- Migrations deployed to Replit PostgreSQL (`heliumdb`)
- Both workflows running: Backend API (port 3001) and Start application (port 5000)

## Migration Notes (Replit Import - Previous)

- Migrated from MySQL to PostgreSQL (Prisma schema updated)
- TypeScript strict mode relaxed (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` set to false) to allow compilation
- nodemon configured with `--transpile-only` to skip type-checking at dev runtime
- Missing UI components created: DropdownMenu, AlertDialog, Modal, Sheet, Label, Textarea, Slider, Toast, Accordion, Form, Calendar, Command
- Missing utility files created: `utils/format.ts`, `utils/string.ts`, `services/LogService.ts`
- CSS circular dependency fixed in globals.css (removed `@apply dark` inside media query)
- framer-motion and @radix-ui/react-scroll-area installed as missing dependencies

## Schema & Controller Fixes (session 2)

Schema fields added to match controller usage:
- `Usuario`: added `avatar`, `telefone`, `cargo`, `departamento` (all optional)
- `Empresa`: added `nextBillingAt DateTime?`
- `Obra`: added `cep`, `valor`, `observacoes` (all optional)
- `FrenteServico`: added `progresso Float? @default(0)`
- `CentroCusto`: added `status String @default("ativo")`, `endereco String?`, `observacoes String?`
- `AvaliacaoCentroCusto`: added `updatedAt DateTime @updatedAt`
- New models added: `Medicao`, `MedicaoEquipamento`, `ModeloMedicao`
- Migration applied: `20260313180344_add_missing_fields`

Controller bugs fixed:
- `EmpresaController`: `centrosCusto` → `centroCustos` in `_count.select` (matches Prisma relation name)
- `AdminBlogController`: `tags` array now JSON-stringified before saving to `String @db.Text` field
- `MedicaoController`: removed invalid `obra.cliente` includes (Obra has no `cliente` relation)
