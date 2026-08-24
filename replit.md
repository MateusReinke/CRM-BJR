# BJR Centro Automotivo Management System

## Overview

BJR Centro Automotivo is a responsive web application for managing an automotive service group made up of multiple, independently-configurable stores (lojas). The system provides management for clients, vehicles, service orders, appointments, inventory, expenses/revenue, employees, and nota fiscal (Brazilian fiscal invoice) issuance across all stores, with a unified dashboard for consolidated reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with custom CSS variables for theme management and per-store color branding
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible interface elements
- **State Management**: TanStack Query (React Query) for server state management and caching. Query keys are shaped `[path]` or `[path, params]` (params as their own key segment, not baked into the path string) so `invalidateQueries({queryKey: [path]})` partially matches every parameterized variant of that query - see `client/src/lib/queryClient.ts`.
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider supporting light/dark modes with per-store color branding

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: Passport.js with the local strategy and cookie-based sessions (no JWT)
- **Session Storage**: PostgreSQL-backed session store (connect-pg-simple) for persistent user sessions
- **API Design**: RESTful endpoints returning a consistent `{ success, data }` / `{ success: false, error }` envelope (`server/utils/errorHandler.ts`)

### Database Design
- **Primary Database**: PostgreSQL. `server/db.ts` picks the driver based on `DATABASE_URL`: Neon's serverless driver for real `*.neon.tech` hosts (production), or plain `node-postgres` for any other Postgres (local dev, CI). This lets the same codebase run against Neon in production and a local/dockerized Postgres elsewhere.
- **Schema Management**: Drizzle Kit for migrations and schema versioning (`npm run db:push`)
- **Multi-tenancy**: Stores (`stores` table) are real, admin-manageable rows - not a hardcoded enum. Every operational table (`users`, `clients`, `vehicles`, `service_orders`, `appointments`, `inventory`, `financial_transactions`, `invoices`) carries a `storeId` foreign key. Admins can add/edit/deactivate stores at runtime from the "Lojas" screen without a schema change.
- **Data Models**: `stores`, `users`, `clients`, `vehicles`, `service_orders`, `appointments`, `inventory`, `financial_categories`, `suppliers`, `financial_transactions`, `invoices`, `invoice_items`.

### Authentication & Authorization
- **Strategy**: Session-based authentication with encrypted password storage using scrypt
- **Role System**: admin, manager, mechanic, seller, hr - permissions are enumerated in `client/src/lib/permissions.ts` and enforced server-side per route (`server/routes.ts`)
- **Store scoping**: admins see/act across all stores; every other role is pinned server-side to their own `storeId` regardless of what the client requests
- **Self-registration**: `POST /api/register` always assigns the lowest-privilege role (`mechanic`) and ignores any role/isActive the client sends - an admin promotes accounts afterwards from "Funcionários". A public, fiscal-data-free `GET /api/stores/public` endpoint lets the registration form offer a store picker without requiring auth.
- **Password reset**: "Esqueci minha senha" on the login page (`POST /api/forgot-password` → `POST /api/reset-password`) e-mails a single-use link valid for 1 hour; the token is stored hashed (`users.resetPasswordTokenHash`) and the response is identical whether or not the e-mail matches an account, so the endpoint can't be used to enumerate registered addresses. Sending goes through `server/utils/mailer.ts`: with `SMTP_HOST` unset it logs the reset link to the server console instead of failing, so the flow is still testable without a mail provider.

### Expenses & Revenue (Despesas)
- `financial_transactions` are categorized (`financial_categories`, shared across the group) and, for expenses, linked to a `supplier`; for income, optionally linked to a `client`.
- The "Despesas" screen shows per-store movement, group totals, and a per-store expense comparison for a given month (`GET /api/financial/by-store/:month`).

### Nota Fiscal (Fiscal Invoice) Issuance
- Each store carries its own fiscal identity (CNPJ, razão social, IE/IM, regime tributário) and nota fiscal configuration (provider, environment, series/next-number counters, estimated ISS rate) - see the `stores` table and the "Lojas" screen.
- `invoices` + `invoice_items` model NFS-e (service), NF-e (product), and NFC-e (consumer) documents, with server-side atomic numbering per store/type and a draft → issue → cancel lifecycle (`server/storage.ts`).
- Issuance goes through a provider abstraction (`server/nfe/`, `NFeProvider` interface) so a real provider (Focus NFe, PlugNotas, eNotas, NFE.io...) can be plugged in later without touching the rest of the app. **Only a local `simulado` provider is implemented** - it assigns numbering and marks the document issued, but never transmits anything to SEFAZ/a prefeitura, and every simulated document is clearly labeled "sem valor fiscal" in the UI. Selecting a real provider name without an implemented adapter fails fast with a `501` explaining what's missing. See `server/nfe/README.md` for what it takes to go live with a real provider (digital certificate + provider account) and how to add the adapter.
- A completed Service Order can push straight into a pre-filled invoice draft via "Emitir Nota Fiscal" → `/invoices?fromServiceOrder=<id>`.

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support (production)
- **Local/other Postgres**: standard `pg` (node-postgres) driver, used automatically when `DATABASE_URL` isn't a Neon host

### UI Framework Dependencies
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives for complex components
- **Lucide React**: Icon library providing consistent iconography throughout the application
- **TailwindCSS**: Utility-first CSS framework with custom configuration for automotive branding

### Development & Build Tools
- **Vite**: Modern build tool with TypeScript support and React plugin integration
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins
- **ESBuild**: Fast JavaScript bundler for production builds

### Authentication & Session Management
- **Passport.js**: Authentication middleware with local strategy implementation
- **Connect-PG-Simple**: PostgreSQL session store adapter for Express sessions

### Form & Data Validation
- **Zod**: TypeScript-first schema validation for API endpoints and form data
- **React Hook Form**: Performant form library with Zod resolver integration
- **Drizzle-Zod**: Integration between Drizzle ORM and Zod for consistent validation

### Specialized Libraries
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe utility for creating component variants
- **CLSX**: Utility for constructing className strings conditionally

## Local Development

1. `npm install`
2. Provision a Postgres database and set `DATABASE_URL` in `.env` (see `.env.example`-style vars: `DATABASE_URL`, `SESSION_SECRET`, `PORT`). `.env` is loaded automatically via Node's `--env-file-if-exists` flag and is gitignored.
3. `npm run db:push` to create/sync the schema.
4. `npm run db:seed` to create the three starter stores (SP1/SP2/SOR), default expense/income categories, and an initial `admin`/`admin123` login (change this password before going anywhere near production).
5. `npm run dev`.

## Deployment (Docker / Coolify)

The `Dockerfile` at the repo root builds and runs the app as a single container (`npm run build` then `node dist/index.js`, serving both the API and the built frontend on `$PORT`, default 5000). It deliberately keeps devDependencies in the final image (drizzle-kit, tsx) so `npm run db:push` / `npm run db:seed` can be run once against production via the platform's "execute a command in this container" feature - there's no separate migrations workflow yet. `curl` is installed in the image because Coolify (and similar platforms) probe the container's health endpoint from inside it.

### Deploying on Coolify

Use **Build Pack: Docker Compose** pointed at `docker-compose.yml`, not the raw Dockerfile option - Coolify parses that file's `environment:` block and pre-fills the app's Environment Variables screen with it, instead of showing an empty list. `PORT`, `NODE_ENV`, `SESSION_SECRET`, and `ENCRYPTION_KEY` already come with real, ready-to-use values; the only thing to edit before deploying is `DATABASE_URL` (`USUARIO`/`SENHA`/`HOST`/`NOME_DO_BANCO` placeholders) - copy it from your Coolify Postgres resource's own "internal" connection string rather than typing it by hand (the internal service hostname, not a LAN/host IP, and definitely not the resource's own generated password retyped from a screenshot - copy/paste it).

Do not set a host port mapping (e.g. `5000:5000`) on the app - the compose file only `expose`s port 5000 internally, and Coolify's proxy routes the configured domain to it. A host-mapped port blocks zero-downtime redeploys because the next container can't bind it until the previous one fully stops.

Once deployed, run `npm run db:push` and `npm run db:seed` once via Coolify's terminal for that container to set up the schema and starter data (three stores, expense categories, an `admin`/`admin123` login - change that password immediately).

Required environment variables are also documented in `.env.example` for local/non-Compose use. `GET /api/health` checks both the process and the database connection, for the platform's health check.

## Migrating an existing deployment off the old unit enum

Older deployments had a hardcoded `unit` Postgres enum (`SP1`/`SP2`/`SOR`) directly on every table instead of a `stores` table + `storeId` foreign key. There is no automatic data migration bundled for this - `npm run db:push` will show destructive statements if pointed at a database still on the old shape. Before running it against a database with real data, back it up and manually: create the `stores` rows first (matching the old enum values so `code` lines up), then backfill each table's new `storeId` column from its old `unit` column by joining on `stores.code`, then drop the old column/enum. Do this by hand against a copy of the data first.
