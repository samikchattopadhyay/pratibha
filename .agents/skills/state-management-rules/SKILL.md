---
name: state-management-rules
description: Review Zustand, TanStack Query, and React Hook Form state division
user-invocable: false
---

# State Management — Scout App

## State Categories

| Category | Tool | Scope | Example |
|----------|------|-------|---------|
| Server State | TanStack Query | Data from REST API, cache, revalidation | Farmers list, pond details |
| Global App State | Zustand | Shared across unrelated components | Auth user, theme, offline status |
| Local UI State | React useState/useReducer | Single component or subtree | Modal open/close, form step |
| URL State | next/navigation searchParams | Filters, search, pagination, tabs | ?page=2&search=ram&tab=pending |
| Form State | React Hook Form | Within a form boundary | Register farmer form |

## Server State (TanStack Query)

### Query Key Convention
```
["farmers", "list", { page, search }]   → paginated list
["farmers", "detail", farmerId]         → single entity
["ponds", "detail", pondId]             → nested resource
["dashboard", "stats"]                  → aggregated data
```

### Query Defaults
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30 seconds fresh
      gcTime: 5 * 60 * 1000,      // 5 minutes in cache
      retry: 2,                   // Retry twice
      refetchOnWindowFocus: true, // Revalidate on focus (field app important)
    },
    mutations: {
      retry: 0,                   // Don't auto-retry mutations
    },
  },
});
```

### Query Hook Template
```ts
// src/hooks/use-farmers.ts
export function useFarmers(params: FarmerListParams) {
  return useQuery({
    queryKey: ["farmers", "list", params],
    queryFn: () => getFarmers(params),
    enabled: !!params, // Don't fetch without params
  });
}
```

### Mutation Hook Template
```ts
// src/hooks/use-create-farmer.ts
export function useCreateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: FarmerCreateDTO) => createFarmer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
    },
  });
}
```

### Offline Mutations
When offline, mutations are queued and retried on reconnect:
```ts
const { mutate, isOffline } = useCreateFarmer();

// If offline, the mutation is queued automatically
mutate(farmerData);

// The OfflineBanner shows queue status
```

## Global State (Zustand)

### What Goes in Zustand
- Authenticated user (never store in TanStack Query)
- UI preferences (theme, language)
- Offline queue status
- Current location / selected area

### What Does NOT Go in Zustand
- Server data (use TanStack Query)
- Form values (use React Hook Form)
- Component-local UI state (use useState)

### Store Conventions
```ts
// One store per domain, not one giant store
stores/
  auth.store.ts     → user, authentication status
  ui.store.ts       → theme, sidebar open, offline status
  sync.store.ts     → offline queue, pending sync count
```

### Store Template
```ts
interface AuthState {
  user: UserType | null;
  isAuthenticated: boolean;
  login: (user: UserType) => void;
  logout: () => void;
}

// Always define the interface first
// Always provide selectors for derived values
export const useAuthUser = () => useAuthStore((s) => s.user);
```

## URL State

### When to Use
- Pagination (?page=2)
- Search/filter (?search=ram, ?status=active)
- Active tab (?tab=pending)
- Sorting (?sort=name_asc)

### Implementation
```tsx
// Server page component
export default function FarmersPage({ searchParams }: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = use(searchParams);
  const { data } = useFarmers({
    page: Number(params.page) || 1,
    search: params.search,
  });
  // ... render
}
```

## Form State (React Hook Form + Zod)

```ts
// Always use this pattern
const form = useForm<FarmerCreateDTO>({
  resolver: zodResolver(farmerCreateSchema),
  defaultValues: {
    firstName: "",
    lastName: "",
    mobile: "",
  },
});

const { mutate, isPending } = useCreateFarmer();

const onSubmit = form.handleSubmit((data) => {
  mutate(data);
});
```

## State Ownership Rules

### Single Source of Truth
- Server data lives ONLY in TanStack Query cache
- Auth user lives ONLY in Zustand auth store
- Form values live ONLY in React Hook Form
- Filters live ONLY in URL searchParams

### Never
- Duplicate server data into Zustand
- Store form data in Zustand
- Store URL state in useState
- Pass server data through props more than 2 levels (use query hooks)

## Offline State Handling

### Network Detection
```ts
// src/stores/ui.store.ts
interface UIState {
  isOnline: boolean;
  setOnline: (online: boolean) => void;
}
```

### Offline Queue
```ts
// src/stores/sync.store.ts
interface SyncState {
  pendingCount: number;
  addToQueue: (mutation: PendingMutation) => void;
  processQueue: () => Promise<void>;
}
```

### Offline Pattern
```
User submits form (offline)
  → Mutation caught and queued in sync.store
  → User sees success with "syncing" badge
  → On reconnect, processQueue() runs
  → Failed items show retry option