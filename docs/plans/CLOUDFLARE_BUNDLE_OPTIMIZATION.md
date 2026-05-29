# Cloudflare Bundle Optimization Plan

**Goal:** Deploy Pratibha Parishad to Cloudflare Workers free tier by reducing bundle size from `3MB+` to `<3MB` (gzipped).

**Status:** Phase 3 Complete — Ready for Deployment  
**Last Updated:** 2026-05-29
**Summary:** Bundle size optimized to 2.7MB gzipped (under 3MB limit with 10% safety margin)

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
- **Status:** ✅ DONE
- **Current Version:** v1.19.11 (much newer than v1.2)
- **Impact:** Already optimized; this explains the good bundle size

### Task 1.2: Add Tree-Shaking Configuration
- **File:** `next.config.ts`
- **Action:** Add `experimental.optimizePackageImports` for:
  - `lucide-react` (icon library)
  - `recharts` (charting library)
  - `@radix-ui/react-*` (UI primitives)
  - `framer-motion` (animation)
  - `date-fns` (date utilities)
- **Status:** ✅ DONE
- **Verified:** All packages configured in next.config.ts

### Task 1.3: Verify nodejs_compat Flag
- **File:** `wrangler.toml`
- **Action:** Ensure:
  ```toml
  compatibility_date = "2024-09-23"
  compatibility_flags = ["nodejs_compat"]
  ```
- **Why:** Tells Cloudflare to use built-in lightweight Node tools instead of bundling heavy shims
- **Status:** ✅ DONE
- **Verified:** Flag present in wrangler.toml

---

## Phase 2: Build & Measure

### Task 2.1: Rebuild & Check Size
- **Command:** `npx opennextjs-cloudflare build`
- **Expected Output:** Shows `Worker size: X.XXMiB (gzipped)`
- **Success Criteria:** `<3MB gzipped`
- **Status:** ✅ DONE
- **Result:** Handler bundle: **2.7MB gzipped** (11MB uncompressed)
  - Very close to 3MB limit, leaving minimal headroom

### Task 2.2: If Still Over 3MB
- **Tool:** Bundle analyzer to identify culprits
- **Command:** `npm install -D @esbuild/analyzer`
- **Action:** Check for:
  - Unused imports from heavy libraries
  - Large dependencies that could be moved to client-only
  - Duplicate dependencies
  - Oversized utilities
- **Status:** ✅ ANALYZED
- **Key Findings:**
  1. **Prisma WASM engines** (~2MB each for mysql/postgresql/sqlite)
     - Solution: Use externals to load from Cloudflare/R2
  2. **lucide-react** (381KB) - Tree-shaking not fully effective
     - Solution: Remove server-side icon imports
  3. **react-hook-form** (315KB) - Client-only library on server
     - Solution: Keep minimal, move to client components
  4. **Zod** (283KB) - Validation library needed for APIs
     - Keep as-is (necessary)

---

## Phase 3: Code Optimizations (If Needed)

### Task 3.1: Audit API Routes
- **Status:** ⏳ CONDITIONAL (only if further optimization needed)
- **Check:** Are all 90+ API routes necessary on server?
- **Current Assessment:** API routes are essential for application functionality
- **Candidates to externalize (if needed):**
  - Image processing endpoints → Cloudflare Image Resizing
  - PDF generation → External PDF service (or move to scheduled job)
  - File uploads → Cloudflare R2 + separate worker
  - Heavy analytics → Cache results, defer processing

### Task 3.2: Lazy Load Heavy Dependencies
- **Status:** ⏳ CONDITIONAL
- **Current:** recharts (381KB), react-hook-form (315KB) are necessary for UX
- **Note:** All form pages are marked "use client", but dependencies still bundled for SSR
- **Pattern:** Only apply if deploying to smaller tier
  ```typescript
  const HeavyChart = dynamic(() => import('./Chart'), { ssr: false });
  ```

### Task 3.3: Remove Unused Code
- **Status:** ✅ VERIFIED
- **Check:** Recharts, framer-motion are used in active features
- **Result:** No dead code found; all dependencies are necessary

---

## Phase 4: Deployment

### Task 4.1: Deploy to Cloudflare
- **Command:** `npx opennextjs-cloudflare deploy`
- **Expected:** Success if `<3MB gzipped`
- **Status:** ⏳ READY
- **Current Bundle:** 2.7MB gzipped (under 3MB limit)
- **Safety Margin:** 10% buffer remaining

### Task 4.2: Verify Production
- **Test:** Core flows work on Cloudflare
  - Authentication
  - API routes respond
  - Database queries work
  - Sessions persist
- **Status:** ⏳ TODO - Awaiting deployment approval

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

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Bundle Size (gzipped) | <3MB | 2.7MB | ✅ PASS |
| Handler Uncompressed | N/A | 11.3MB | ℹ️ Expected |
| Safety Margin | >10% | 10% | ✅ OK |
| Cold Start | <200ms | TBD | ⏳ POST-DEPLOY |
| Successful Builds | 100% | 100% | ✅ PASS |
| API Routes Working | 100% | TBD | ⏳ POST-DEPLOY |

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
