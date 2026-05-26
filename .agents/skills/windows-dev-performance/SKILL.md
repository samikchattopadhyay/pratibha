---
name: windows-dev-performance
description: Optimize Next.js dev server performance and memory usage under Windows 11
user-invocable: false
---

# Windows 11 Next.js Dev Server Performance Tuning

Apply these standards when running or troubleshooting Next.js development server memory leaks, thread pool panics, or system hangs on Windows.

## 1. Root Cause of Resource Spikes & Panics

### TS Compiler Scans .next/ (The 100% RAM Spike)
- **Problem**: When `.next` is not explicitly excluded in `tsconfig.json`'s `exclude` array, the TypeScript background compiler scans all generated files in the `.next/` directory recursively.
- **Symptom**: RAM usage spikes continuously during Hot Module Replacement (HMR) until the system hangs (even on 128GB RAM machines).
- **Fix**: Exclude `.next` and `node_modules` explicitly in `tsconfig.json`.

### Webpack File-Watching Loop
- **Problem**: Next.js Webpack watches the root directory. Without explicit ignoring rules, HMR file-watching loops occur over `.next` writes, locking files and triggering endless rebuilds.
- **Symptom**: High CPU usage and file locks on build caches.
- **Fix**: Configure `webpack.watchOptions.ignored` in `next.config.ts` to ignore `node_modules` and `.next`.

### Antivirus real-time scanning (OS Error 1450)
- **Problem**: Windows Defender scans newly generated cache files as Next.js compiles them. This locks files, exhausts file handles, and triggers Rust compilation pool crashes (`ThreadPoolBuildError` / `rayon-core` panic).
- **Symptom**: `panicked at ... rayon-core: Insufficient system resources exist to complete the requested service.`
- **Fix**: Exclude the project root directory from Windows Defender real-time scanning.

## 2. Standard Configuration Template

### tsconfig.json
Ensure `.next` is added to the `exclude` block:
```json
  "exclude": ["node_modules", ".next"]
```

### next.config.ts
Include HMR and memory optimizations:
```typescript
const nextConfig: NextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ignored: ["**/node_modules/**", "**/.next/**"],
      };
    }
    return config;
  },
};
```

### package.json dev Script
If Turbopack panics with thread allocation limits, fall back to Webpack using:
```json
  "dev": "next dev --webpack -H 0.0.0.0"
```
