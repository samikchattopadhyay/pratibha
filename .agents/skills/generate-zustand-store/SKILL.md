---
name: generate-zustand-store
description: Create Zustand stores for global state management
user-invocable: false
---

# Skill: Generate Zustand Store

## Usage

Use for global app state: auth, UI state, filters, notifications. Never use for form state (use React Hook Form instead) or server state (use TanStack Query).

---

## Pattern: Persisted Auth Store

```ts
// src/stores/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  role: "scout" | "admin" | "farmer";
  mobile: string;
}

export interface AuthState {
  // State
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token, refreshToken) => set({ token, refreshToken }),
      logout: () => set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: "fenbridge-auth", // localStorage key
      partialize: (state) => ({
        // Only persist these fields, exclude isLoading
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

**Key Points:**
- `name: "fenbridge-auth"` — localStorage key (standard pattern: `fenbridge-<feature>`)
- `partialize` — exclude ephemeral state like `isLoading` from persistence
- Named export `export const useAuthStore`
- Minimal state, pure functions for updates

---

## Pattern: Non-Persisted UI Store

```ts
// src/stores/ui.store.ts
import { create } from "zustand";

export type ConnectivityStatus = "online" | "offline" | "reconnecting";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

export interface UiState {
  // State
  sidebarOpen: boolean;
  connectivity: ConnectivityStatus;
  toasts: Toast[];
  pendingSyncCount: number;

  // Actions
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setConnectivity: (status: ConnectivityStatus) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  // Initial state
  sidebarOpen: false,
  connectivity: "online",
  toasts: [],
  pendingSyncCount: 0,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
  setConnectivity: (status) => set({ connectivity: status }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts.slice(-4), newToast], // Keep last 5
    }));

    // Auto-dismiss if duration specified
    if (toast.duration) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
}));
```

**Key Points:**
- **No persistence** — ephemeral UI state
- `create<State>((set, get) => ({...}))`  — callback syntax
- Named export `export const useUiStore`
- Toast queue: limited to 5 items, auto-dismiss with setTimeout
- Toast ID: `crypto.randomUUID()` or `Date.now() + Math.random()`

---

## Pattern: Default Export (Feature Store)

```ts
// src/stores/notification-store.ts
import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface NotificationState {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  // Convenience methods
  success: (message: string, duration?: number) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const useNotificationStore = create<NotificationState>((set) => ({
  toasts: [],

  showToast: (toast) => {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-dismiss (errors don't auto-dismiss by default)
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration ?? 3000);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  success: (message, duration = 3000) => {
    set((state) => {
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      return {
        toasts: [...state.toasts, { id, message, type: "success", duration }],
      };
    });
  },

  error: (message) => {
    set((state) => {
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      return {
        toasts: [...state.toasts, { id, message, type: "error", duration: 0 }],
      };
    });
  },

  info: (message) => {
    set((state) => {
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      return {
        toasts: [...state.toasts, { id, message, type: "info", duration: 3000 }],
      };
    });
  },

  warning: (message) => {
    set((state) => {
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      return {
        toasts: [...state.toasts, { id, message, type: "warning", duration: 3000 }],
      };
    });
  },
}));

export default useNotificationStore;
```

**Key Points:**
- **Default export** (not named) — `export default useNotificationStore`
- **Convenience methods** — `.success()`, `.error()`, `.info()`, `.warning()`
- **Toast ID**: fallback for older browsers: `crypto.randomUUID?.() || timestamp`
- **Error default**: `duration: 0` (never auto-dismiss) — user must explicitly close
- **Other types**: `duration: 3000` (3s auto-dismiss)

---

## Pattern: Feature-Scoped Filter Store

```ts
// src/stores/filter-store.ts
import { create } from "zustand";

export type FilterState = Record<string, unknown>;

interface FilterStoreState {
  filters: Record<string, FilterState>; // feature -> filter state

  getFilters: (feature: string) => FilterState;
  setFilters: (feature: string, filters: FilterState) => void;
  updateFilter: (feature: string, key: string, value: unknown) => void;
  clearFilters: (feature: string) => void;
  clearAllFilters: () => void;
}

const useFilterStore = create<FilterStoreState>((set, get) => ({
  filters: {},

  getFilters: (feature) => get().filters[feature] || {},

  setFilters: (feature, filters) =>
    set((state) => ({
      filters: { ...state.filters, [feature]: filters },
    })),

  updateFilter: (feature, key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [feature]: { ...state.filters[feature], [key]: value },
      },
    })),

  clearFilters: (feature) =>
    set((state) => ({
      filters: { ...state.filters, [feature]: {} },
    })),

  clearAllFilters: () => set({ filters: {} }),
}));

export default useFilterStore;
```

**Key Points:**
- **Feature-scoped** — separate filter state per page/feature
- **Flexible** — any key-value structure supported
- **No persistence** — filters clear on reload
- **Default export**

---

## Export Patterns

| Pattern | When to Use | Example |
|---------|-----------|---------|
| **Named export** | Core stores (auth, ui) | `export const useAuthStore` |
| **Default export** | Feature stores (filter, notification) | `export default useFilterStore` |

---

## TypeScript Interface Structure

State + actions in single interface:

```ts
export interface MyState {
  // ===== STATE =====
  field1: string;
  field2: number;
  list: string[];

  // ===== ACTIONS =====
  setField1: (value: string) => void;
  addToList: (item: string) => void;
  reset: () => void;
}
```

---

## Critical Rules

- ✅ **Minimal state** — only what's globally shared
- ✅ **Named exports** for core stores; default exports for features
- ✅ **Persistence key** format: `fenbridge-<feature>`
- ✅ **Partialize** to exclude ephemeral state from persistence
- ✅ **Use `get()`** to read current state inside actions
- ✅ **Toast ID**: `crypto.randomUUID()` with `Math.random()` fallback
- ✅ **Auto-dismiss** via `setTimeout` inside action (not component)
- ✅ **Errors never auto-dismiss** unless user specifies duration
- ✅ **No context providers** — Zustand stores accessed directly
- ✅ **No mixing server state** — TanStack Query for API data, Zustand for global UI

---

## Example Usage in Components

```tsx
"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";

export default function Dashboard() {
  // Access stores
  const { user, logout } = useAuthStore();
  const { addToast, connectivity } = useUiStore();

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      {connectivity === "offline" && <p>You're offline</p>}
      <button
        onClick={() => {
          logout();
          addToast({ message: "Logged out", type: "success" });
        }}
      >
        Logout
      </button>
    </div>
  );
}
```
