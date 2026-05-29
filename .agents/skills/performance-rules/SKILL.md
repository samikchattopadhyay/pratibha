---
name: performance-rules
description: Audit React Server Components, lazy loading, and rendering footprints
user-invocable: false
---

# Performance Rules

- Maximize React Server Components usage to keep client bundles thin.
- Avoid duplicate useEffect dependencies and prefer derived values over sync-state.
- Lazy load heavy modals and large widgets with dynamic imports.
- Minimize layout shifts (CLS) by giving images and visual wrappers explicit dimensions.
- Use TanStack Query stale times to avoid duplicate or aggressive endpoint queries.
