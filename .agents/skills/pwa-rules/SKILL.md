---
name: pwa-rules
description: Check Serwist PWA app-shell, caching strategies, and sync queues
user-invocable: false
---

# PWA Rules — Scout App

## Overview
The Scout app operates in rural agricultural areas with poor and intermittent connectivity. PWA capabilities are not optional — they are core to the application's usability.

## Must-Have PWA Features

### 1. Offline-First Data Entry
- All forms MUST work offline
- Mutations are queued locally when offline
- On reconnect, queued mutations are processed FIFO
- User sees clear "syncing" indicators
- Failed sync items show retry option

### 2. Offline UI Awareness
- `OfflineBanner` component shown when connectivity lost
- "Last synced: X minutes ago" timestamps
- Pending sync count badge on relevant screens
- Grayed-out actions that require connectivity (e.g., search)

### 3. App Shell Caching
- Navigation shell (header, bottom nav, sidebar) cached aggressively
- Layout components never show loading after first load
- Static assets (fonts, icons) cached long-term

### 4. API Response Caching
- GET requests: stale-while-revalidate
- Reference data (dropdowns, lists): cache aggressively (24h)
- Dynamic data (dashboard stats): short cache (30s)
- Never cache: POST, PUT, DELETE responses

### 5. Installability
```json
// public/manifest.json
{
  "name": "Makhana Scout",
  "short_name": "Scout",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 6. Safe Area Handling
```css
/* For iPhone notch / Android cutout */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

.safe-top {
  padding-top: env(safe-area-inset-top, 16px);
}
```

## Service Worker Strategy

### Using Serwist
```ts
// serwist.config.ts
export default {
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  globDirectory: ".next/static",
  globPatterns: ["**/*.{js,css,woff2,png,svg,jpg}"],
};
```

### Cache Strategy Matrix

| Resource Type | Strategy | Max Age | Max Entries |
|--------------|----------|---------|-------------|
| Navigation shell (HTML) | NetworkFirst | — | 1 |
| Static assets (JS/CSS) | CacheFirst | 30 days | 50 |
| Fonts | CacheFirst | 365 days | 10 |
| Images (app UI) | CacheFirst | 7 days | 100 |
| Images (user content) | StaleWhileRevalidate | 1 day | 200 |
| API GET (reference data) | StaleWhileRevalidate | 24 hours | 50 |
| API GET (dynamic data) | NetworkFirst | — | 0 |
| API POST/PUT/DELETE | NetworkOnly | — | 0 |

## Offline Mutation Queue

### Architecture
```
Form Submit (offline)
  → useCreateFarmer().mutate(data)
  → detect offline → queue in sync.store
  → show success toast with "pending sync" badge
  → on reconnect:
      → processQueue() runs all pending mutations
      → each mutation sends to API
      → success: remove from queue, invalidate queries
      → failure: mark as error, show retry button
```

### Queue Implementation Pattern
```ts
// src/stores/sync.store.ts
interface SyncState {
  queue: PendingMutation[];
  pendingCount: number;
  isProcessing: boolean;
  lastSyncAt: Date | null;
  addToQueue: (mutation: PendingMutation) => void;
  processQueue: () => Promise<void>;
  retryItem: (id: string) => Promise<void>;
  removeItem: (id: string) => void;
}
```

### Pending Mutation Shape
```ts
interface PendingMutation {
  id: string;
  type: "create" | "update" | "delete";
  endpoint: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  status: "pending" | "failed";
}
```

## Network Awareness

### Online/Offline Detection
```tsx
// In AppShell or root layout
useEffect(() => {
  const handleOnline = () => setOnline(true);
  const handleOffline = () => setOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);
```

### Network Quality
- Don't assume "online" means good connection
- Show spinner for requests > 3 seconds
- Timeout mutations after 30 seconds
- Provide "try again" for failed requests

## PWA Checklist Per Screen

- [ ] Works without internet after first load
- [ ] Form data persists if submitted offline
- [ ] OfflineBanner visible when disconnected
- [ ] Actions that need network are disabled/grayed offline
- [ ] No white screen when offline (cached app shell)
- [ ] Touch interactions work in standalone mode
- [ ] Safe area insets respected on notched devices
- [ ] No pull-to-refresh conflicts with app scrolling
- [ ] Install prompt appears at appropriate time

## Testing PWA Behavior

### DevTools
1. Open Chrome DevTools → Application → Service Workers
2. Check "Offline" to simulate disconnection
3. Verify app shell loads from cache
4. Verify forms queue mutations
5. Uncheck "Offline" to verify sync

### Lighthouse
- Run PWA audit regularly
- Target score: 90+
- Check "Installable" and "Offline support" specifically

### Real Device Testing
- Test on actual low-end Android device
- Test with 2G/3G throttling
- Test in airplane mode
- Test install → use offline → go online flow