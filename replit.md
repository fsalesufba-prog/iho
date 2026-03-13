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

## Migration Notes (Replit Import)

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
