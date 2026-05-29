# Cloudflare Bundle Optimization Plan

**Goal:** Deploy Pratibha Parishad to Cloudflare Workers free tier by reducing bundle size from `3MB+` to `<3MB` (gzipped).

**Status:** In Progress  
**Last Updated:** 2026-05-29

---

## Current State

- **Project Type:** Full-stack Next.js 19 with 90+ API routes
- **Current Bundle Size:** 3MB+ (exceeds limit)
- **Error:** `Your Worker exceeded the size limit of 3 MiB`
- **Deployment Tool:** @opennextjs/cloudflare
- **Target:** Cloudflare Workers (Free: 3MB, Paid: 10MB)

---

## Phase 1: Update Dependencies & Add Tree-Shaking

### Task 1.1: Update @opennextjs/cloudflare to Latest
- **What:** Latest v1.2 (June 5, 2025) includes 30% size reduction
- **Benefit:** 2.3MB → 1.6MB gzipped (without any code changes)
- **Command:**
  ```bash
  npm install -D @opennextjs/cloudflare@latest
  ```
- **Status:** ⏳ TODO

### Task 1.2: Add Tree-Shaking Configuration
- **File:** `next.config.ts`
- **Action:** Add `experimental.optimizePackageImports` for:
  - `lucide-react` (icon library)
  - `recharts` (charting library)
  - `@radix-ui/react-*` (UI primitives)
  - `framer-motion` (animation)
  - `date-fns` (date utilities)
- **Status:** ⏳ TODO

### Task 1.3: Verify nodejs_compat Flag
- **File:** `wrangler.toml`
- **Action:** Ensure:
  ```toml
  compatibility_date = "2024-09-23"
  compatibility_flags = ["nodejs_compat"]
  ```
- **Why:** Tells Cloudflare to use built-in lightweight Node tools instead of bundling heavy shims
- **Status:** ⏳ TODO

---

## Phase 2: Build & Measure

### Task 2.1: Rebuild & Check Size
- **Command:** `npx opennextjs-cloudflare build`
- **Expected Output:** Shows `Worker size: X.XXMiB (gzipped)`
- **Success Criteria:** `<3MB gzipped`
- **Status:** ⏳ TODO

### Task 2.2: If Still Over 3MB
- **Tool:** Bundle analyzer to identify culprits
- **Command:** `npm install -D @esbuild/analyzer`
- **Action:** Check for:
  - Unused imports from heavy libraries
  - Large dependencies that could be moved to client-only
  - Duplicate dependencies
  - Oversized utilities
- **Status:** ⏳ TODO

---

## Phase 3: Code Optimizations (If Needed)

### Task 3.1: Audit API Routes
- **Check:** Are all 90+ API routes necessary on server?
- **Candidates to externalize:**
  - Image processing endpoints → Cloudflare Image Resizing
  - PDF generation → External PDF service (or move to scheduled job)
  - File uploads → Cloudflare R2 + separate worker
  - Heavy analytics → Cache results, defer processing

### Task 3.2: Lazy Load Heavy Dependencies
- **Example:** Recharts, Framer Motion only needed on client
- **Pattern:**
  ```typescript
  const HeavyChart = dynamic(() => import('./Chart'), { ssr: false });
  ```

### Task 3.3: Remove Unused Code
- **Check:** Unused imports, abandoned components, dead code
- **Priority:** Remove before deployment

---

## Phase 4: Deployment

### Task 4.1: Deploy to Cloudflare
- **Command:** `npx opennextjs-cloudflare deploy`
- **Expected:** Success if `<3MB gzipped`
- **Status:** ⏳ TODO

### Task 4.2: Verify Production
- **Test:** Core flows work on Cloudflare
  - Authentication
  - API routes respond
  - Database queries work
  - Sessions persist
- **Status:** ⏳ TODO

---

## Rollback Plan

If optimization fails and bundle stays `>3MB`:
1. Keep local build ready
2. Consider extracting heavy features to separate Workers:
   - Certificate generation → Separate Worker
   - Judge scoring calculations → Separate Worker
   - Analytics → Separate Worker
3. Use Cloudflare's worker composition pattern

---

## Key Metrics to Track

| Metric | Target | Current |
|--------|--------|---------|
| Bundle Size (gzipped) | <3MB | 3MB+ |
| Cold Start | <200ms | TBD |
| Successful Builds | 100% | TBD |
| API Routes Working | 100% | TBD |

---

## References

- [OpenNext Troubleshooting](https://opennext.js.org/cloudflare/troubleshooting)
- [Cloudflare v1.2 Optimization](https://developers.cloudflare.com/changelog/post/2025-06-05-open-next-size/)
- [Next.js Package Bundling](https://nextjs.org/docs/app/guides/package-bundling)

---

## Notes

- The latest @opennextjs/cloudflare v1.2 is critical — it removed Babel and @ampproject/toolbox-optimizer, saving ~700KB gzipped
- Tree-shaking will save another 200-500KB depending on what's actually imported
- If still over 3MB after these changes, investigate which specific dependencies are consuming most space
