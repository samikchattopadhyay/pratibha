# Pratibha Parishad Architecture & AI Engineering Standards

---

## Project Philosophy

Pratibha Parishad is a **production-grade talent competition management platform** designed to orchestrate participant intake, jury evaluation, score moderation, settings configuration, and digital certificate fulfillment.

**Core Priorities (in order):**

1. **Maintainability** — Clean code, clear boundaries, minimal cognitive load.
2. **Scalability** — Modular pages, decoupled REST APIs, extensible schema profiles.
3. **Aesthetics** — Consistent premium design system utilizing HSL tailored colors (Charcoal, Terracotta, and Gold).
4. **Performance** — Fast server-rendered pages where appropriate, server-side search pagination, and efficient database indexing.

---

## Project Commands

Use these commands when building, testing, or serving the application:

| Task | Command | Description |
|------|---------|-------------|
| **Development** | `npm run dev` | Starts the local Next.js development server on `http://localhost:3000`. |
| **Build** | `npm run build` | Compiles the production build bundle. |
| **Lint** | `npm run lint` | Runs syntax checks and ESLint verification. |
| **Type Check** | `npx tsc --noEmit` | Verifies TypeScript compilation and static type safety. |
| **DB Migrate** | `npx prisma migrate dev` | Generates and applies migrations. |
| **Prisma Studio** | `npx prisma studio` | Launches the database browser console. |

---

## Technology Stack

* **Framework**: Next.js (App Router) + React 19 + TypeScript (Strict Mode)
* **Styling**: TailwindCSS (Charcoal dark-mode core, Terracotta accents, Gold highlights)
* **Database**: Prisma ORM + PostgreSQL
* **Authentication**: NextAuth.js (Credentials provider, secure JWT sessions)
* **Validation**: Zod (schema specifications)

---

## Directory Layout

* `docs/` — Core architecture, credentials, UI/UX workflow guidelines.
* `prisma/` — Database schema definitions and seed engines.
* `src/` — Primary application source code.
  * `app/` — Next.js layout structures, page routers, and backend API routes.
    * `admin/` — Admin workspace views.
    * `judge/` — Jury scorecard evaluation views.
    * `parent/` — Parent intake dashboard and enrollment views.
    * `api/` — API endpoint handlers (`/api/admin/`, `/api/judge/`, `/api/parent/`).
  * `components/` — UI shared primitives (Header, Footer, layout grids, components).
  * `lib/` — Shared utilities, client configurations (Prisma instance, helpers).
  * `types/` — TypeScript schema interfaces and dashboard representations.

---

## Architectural Standards

### Decoupled Routing & Authorization
- **Header & Navigation**: The dynamic Header respects authentication state (`Session`). 
- **Roles**: Routes route conditionally to specialized portals based on user role (Admin/Moderator, Judge, Parent).
- **Separation of Concerns**: UI dashboards request resources through modular `/api/...` endpoints rather than querying the database directly in rendering paths.

### TypeScript and Type Safety
- **No `any`**: All interface interactions must be typed explicitly.
- **Model Synchronization**: Models returned by backend routes must align with client interface typings.

### Loading UI & Theme Rules
- **Always Use `<Loading />` Component**: Any loading spinner, indicator, authenticating message, or progress screen MUST use the unified `<Loading />` component from `@/components/Loading`. **Never** write duplicate SVG loading spinner markup, inline animated elements (such as `animate-spin` classes on lucide icons), or custom spinner wrappers.
  - Page-level loaders: Use `<Loading variant="screen" text="..." />`.
  - Modal/overlay loaders: Use `<Loading variant="overlay" text="..." />`.
  - Inline button/state loaders: Use `<Loading variant="inline" text="..." />` which supports text color inheritance (`text-current` spinner track color).
- **Proper Light/Dark Theme Contrast**: Loader cards/overlays must respect light and dark themes properly. Use `bg-white dark:bg-charcoal-light border border-terracotta/20 dark:border-terracotta/30` for floating overlay card elements. Light theme components must use a bright background (`bg-white`) and explicit borders (`border-terracotta/20`) to stand out from the cream page background (`#fcf9f2`). Do not let overlay dialog elements blend into the cream background.

### AJAX Pagination Rules
- **Always Use Server-Side AJAX Pagination**: Do **NOT** use client-side local pagination (slicing lists in memory, e.g., `.slice((page - 1) * limit, page * limit)`) for list tables, grids, and workspaces (like Circuits/Competitions, Transactions/Finance, or social metrics).
- **Database Pagination**: All lists must be paginated server-side (AJAX pagination using database-level `skip` and `take` via query params) to ensure consistent data loading states, proper memory usage, and loading animations.
- **Code Cleanliness**: Do not leave unused imports or abandoned code variables. Delete unused variables, imports, or files.

---

## Expected Agent Behavior

1. **Keep Views Modular**: Maximum line length for UI layout files is **500 lines** when complex dashboard logic is integrated. Decompose workspaces where appropriate.
2. **Never Hardcode Secret Credentials**: Store keys, credentials, and ports in `.env` configuration files. Do not commit sensitive environment setups.
3. **Verify Before Completion**:
   - Always run `npx tsc --noEmit` to verify type safety.
   - Run `npm run lint` to verify syntax and guidelines compliance.
   - Run `npm run build` to verify production deployment readiness.

---

## Windows 11 Next.js Dev/HMR Performance Checklist

If the development server spikes CPU/RAM to 100% or hangs:
1. **Exclude `.next` in `tsconfig.json`**: Ensure `.next` is listed in the `exclude` array to prevent TypeScript compiler loops scanning dynamic caches.
2. **Configure Watch Ignored Folders**: Ensure `next.config.ts` includes `watchOptions.ignored: ["**/node_modules/**", "**/.next/**"]` to prevent infinite HMR reload loops.
3. **Use Webpack Compiler**: If Turbopack crashes with thread allocation limits, run `next dev --webpack` to use Webpack.
4. **Antivirus Exclusions**: Exclude the project root directory from Windows Defender real-time scanning to avoid file locking and OS Error 1450.