---
name: generate-dashboard
description: Generate mobile-first KPI, analytics, and overview dashboard screens
user-invocable: false
---

# Prompt: Generate Dashboard Screen

## Usage
Use for dashboard, KPI, analytics, and overview screens.

---

You are a principal frontend engineer building a production-grade mobile-first dashboard.

## TECH STACK
- Next.js 15 App Router
- React 19
- TailwindCSS
- shadcn/ui
- Zustand (global state)
- TanStack Query (server state caching)

## DASHBOARD REQUIREMENTS
- Mobile-first layouts using flexible grid scales
- Large, thumb-friendly KPI cards with trend indicators
- Lazy-loaded, interactive widgets and graphs
- Global filter sheets/panels with URL sync
- Proper loading skeletons for all displays
- Offline fallback modes with local storage/Zustand cached summaries

## OUTPUT
1. Dashboard layout component
2. Reusable widgets and KPI components
3. Responsive charts and visualizations
4. URL filtering and state hooks
5. Loading boundaries and skeleton assets
