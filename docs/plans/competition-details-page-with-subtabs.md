# Competition Details Page System — Implementation Plan

**Status:** 🔵 PLANNED  
**Date Created:** 2026-05-26  
**Build Target:** Production Ready  
**Complexity:** High (Multi-Component, Multi-API)

---

## Executive Summary

This plan outlines the implementation of a **competition details page** with 4 sub-tabs (Participants, Live Voting, Certificates, Courier & Shipping) that users can access by clicking on a competition card. The design follows existing architectural patterns from the Settings page, including URL-synced sub-tabs, modular components, and server-side pagination.

**Key Features:**
- URL-based sub-tab routing with browser back/forward support (`?subtab=participants`)
- Competition-scoped data fetching (server-side filtering at API level)
- Modular sub-tab components (each under 300 lines)
- Full TypeScript strict mode with no `any` types
- Server-side AJAX pagination for all data-heavy tabs
- Industry best practices for competition management UI/UX

---

## 1. URL Structure & Navigation

### Route Pattern
```
/admin/dashboard/competitions/[id]?subtab=participants
/admin/dashboard/competitions/[id]?subtab=voting
/admin/dashboard/competitions/[id]?subtab=certificates
/admin/dashboard/competitions/[id]?subtab=shipping
```

### Navigation Flow
1. User clicks competition card in `CompetitionsTab`
2. Navigates to `/admin/dashboard/competitions/[competitionId]`
3. Default subtab is `participants`
4. Clicking sidebar buttons updates URL via `window.history.replaceState()`
5. Browser back/forward buttons work (URL sync enables this)
6. Direct linking to specific subtabs supported (e.g., share `?subtab=voting` link)

### Breadcrumb Display
```
Admin Dashboard > Competitions > [Competition Title]
                                [Active/Closed] [State/National]
```

---

## 2. Component Architecture

### 2.1 Server-Side Page Component
**File:** `/src/app/admin/dashboard/competitions/[id]/page.tsx`

Responsibilities:
- Extract `competitionId` from URL params
- Fetch competition metadata server-side (for breadcrumb/header)
- Render `CompetitionDetailsLayout` with metadata passed as prop
- Use `Suspense` boundary for streaming UI

**Lines:** 80-120

```typescript
async function CompetitionDetailsPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>; 
  searchParams: Promise<Record<string, string>>;
}) {
  const { id: competitionId } = await params;
  const { subtab } = await searchParams;
  
  // Fetch competition metadata server-side
  const competition = await db.competition.findUnique({
    where: { id: competitionId },
    select: {
      id: true,
      title: true,
      scope: true,
      bannerUrl: true,
      isActive: true,
      category: { select: { name: true } },
      registrationDeadline: true,
    },
  });

  return (
    <Suspense fallback={<Loading variant="screen" />}>
      <CompetitionDetailsLayout 
        competition={competition}
        competitionId={competitionId}
        initialSubtab={(subtab || "participants") as SubTab}
      />
    </Suspense>
  );
}
```

---

### 2.2 Client-Side Layout Component
**File:** `/src/components/admin/CompetitionDetailsLayout.tsx`

Responsibilities:
- Manage sub-tab state and URL synchronization
- Render left sidebar with 4 sub-tab buttons
- Render right content area with active sub-tab component
- Handle sub-tab navigation with `window.history.replaceState()`
- Sync state from URL changes (back/forward support)

**Lines:** 200-250

**Key State:**
```typescript
const [activeSubTab, setActiveSubTab] = useState<SubTab>("participants");
const searchParams = useSearchParams();
const router = useRouter();

// Sync URL → State on mount/back-forward
useEffect(() => {
  const subtab = searchParams.get("subtab") as SubTab;
  if (subtab && ["participants", "voting", "certificates", "shipping"].includes(subtab)) {
    setActiveSubTab(subtab);
  }
}, [searchParams]);

// Handle tab change + URL update
const handleTabChange = (tab: SubTab) => {
  setActiveSubTab(tab);
  const params = new URLSearchParams(searchParams);
  params.set("subtab", tab);
  window.history.replaceState(null, "", `?${params.toString()}`);
};
```

**Render Structure:**
```tsx
<div className="flex flex-col md:flex-row gap-6">
  {/* LEFT SIDEBAR */}
  <div className="w-full md:w-64 flex flex-col gap-1">
    <button onClick={() => handleTabChange("participants")}>...</button>
    <button onClick={() => handleTabChange("voting")}>...</button>
    <button onClick={() => handleTabChange("certificates")}>...</button>
    <button onClick={() => handleTabChange("shipping")}>...</button>
  </div>

  {/* RIGHT CONTENT */}
  <div className="flex-1">
    {activeSubTab === "participants" && <ParticipantsSubTab {...} />}
    {activeSubTab === "voting" && <VotingSubTab {...} />}
    {activeSubTab === "certificates" && <CertificatesSubTab {...} />}
    {activeSubTab === "shipping" && <CourierShippingSubTab {...} />}
  </div>
</div>
```

---

### 2.3 Sub-Tab Components

All sub-tabs follow the same pattern:
- Receive `competitionId` as prop
- Manage local pagination state (page, limit, filter, search)
- Fetch data via API using `useEffect`
- Show `<Loading />` during fetch
- Display error message if fetch fails
- Render data in paginated table/grid

#### **Participants SubTab**
**File:** `/src/components/admin/competition-details/ParticipantsSubTab.tsx`

**Purpose:** Show all registrations for the competition

**Data Fetched:** Registrations filtered by competitionId

**Features:**
- Table: registration ID, student name, category, status, payment, assigned judges
- Filters: ALL, PENDING_VERIFICATION, VERIFIED, REJECTED, DISQUALIFIED
- Search: by student name or registration ID
- Pagination: server-side with page/limit params
- Actions: Verify entry, assign judge, view details
- Metrics: "X of Y registrations verified", "Z judges unassigned"

**Lines:** 250-300

#### **Live Voting SubTab**
**File:** `/src/components/admin/competition-details/VotingSubTab.tsx`

**Purpose:** Show judge assignments and voting progress

**Data Fetched:** Judge assignments for this competition

**Features:**
- Judge cards: name, tier, assignment count, submission count, average score
- Status indicators: "In Progress", "Complete", "Conflict Detected"
- Filter: by judge tier or submission status
- Pagination: server-side for large judge panels
- Actions: View judge's scorecards, flag conflict entries
- Metrics: "X judges assigned", "Y submissions completed", "Average score: Z"

**Lines:** 220-280

#### **Certificates SubTab**
**File:** `/src/components/admin/competition-details/CertificatesSubTab.tsx`

**Purpose:** Show certificate generation status and sharing metrics

**Data Fetched:** Certificate records for entries in this competition

**Features:**
- List: registration ID, student name, certificate type, status, QR code
- Status indicators: PENDING, GENERATED, SHARED
- Bulk action: "Generate Certificates for All Eligible Entries"
- Pagination: server-side for certificate list
- Metrics: "X pending", "Y generated", "Z shared"
- Actions: Generate individual cert, view QR, resend certificate
- QR verification: link to verify certificate authenticity

**Lines:** 220-280

#### **Courier & Shipping SubTab**
**File:** `/src/components/admin/competition-details/CourierShippingSubTab.tsx`

**Purpose:** Track physical awards shipment and logistics

**Data Fetched:** Shipment records for winners in this competition

**Features:**
- List: registration ID, student name, shipment status, carrier, tracking URL, ETA
- Status indicators: PENDING, LABEL_GENERATED, PICKED_UP, IN_TRANSIT, DELIVERED
- Bulk action: "Create Shipping Labels for All Pending"
- Pagination: server-side for shipment list
- Metrics: "X pending", "Y in transit", "Z delivered"
- Actions: Generate label, view tracking, mark as delivered
- Carrier integration: links to tracking pages

**Lines:** 220-280

---

## 3. API Routes Required

All routes under `/api/admin/competitions/[id]/`:

### 3.1 Metadata Endpoint
**Route:** `GET /api/admin/competitions/[id]`

**Request:** `GET /api/admin/competitions/abc123`

**Response:**
```json
{
  "id": "abc123",
  "title": "Borsha Bodhon 2026",
  "scope": "STATE",
  "category": "Bengali Recitation",
  "bannerUrl": "https://...",
  "isActive": true,
  "registrationDeadline": "2026-06-15T23:59:59Z",
  "startDate": "2026-07-01T10:00:00Z",
  "endDate": "2026-07-05T18:00:00Z",
  "totalParticipants": 142,
  "totalJudges": 8
}
```

**Lines:** 50-80

---

### 3.2 Participants Endpoint
**Route:** `GET /api/admin/competitions/[id]/participants`

**Query Params:**
```
page=1
limit=10
filter=ALL|PENDING_VERIFICATION|VERIFIED|REJECTED|DISQUALIFIED
search=studentName|registrationId
```

**Response:**
```json
{
  "data": [
    {
      "id": "reg-uuid-1",
      "registrationId": "PP-2026-REC-0021",
      "studentName": "Bhaskar Chattopadhyay",
      "categoryName": "Bengali Recitation",
      "status": "VERIFIED",
      "paymentStatus": "SUCCESS",
      "assignedJudges": [
        { "id": "j1", "name": "Prof. Swapna Sen", "score": 85 }
      ],
      "createdAt": "2026-05-20T10:30:00Z"
    }
  ],
  "pagination": {
    "totalCount": 142,
    "totalPages": 15,
    "currentPage": 1,
    "limit": 10
  }
}
```

**Lines:** 100-150

---

### 3.3 Voting Endpoint
**Route:** `GET /api/admin/competitions/[id]/voting`

**Query Params:**
```
page=1
limit=10
filter=ALL|PENDING|IN_PROGRESS|COMPLETE
```

**Response:**
```json
{
  "data": [
    {
      "judgeId": "j1",
      "judgeName": "Prof. Swapna Sen",
      "tier": "NATIONAL",
      "assignmentCount": 18,
      "submittedCount": 16,
      "averageScore": 78.5,
      "isOutlier": false,
      "completionPercentage": 88.9
    }
  ],
  "pagination": { ... }
}
```

**Lines:** 100-150

---

### 3.4 Certificates Endpoint
**Route:** `GET /api/admin/competitions/[id]/certificates`

**Query Params:**
```
page=1
limit=10
status=ALL|PENDING|GENERATED|SHARED
```

**Response:**
```json
{
  "data": [
    {
      "id": "cert-1",
      "registrationId": "PP-2026-REC-0021",
      "studentName": "Bhaskar Chattopadhyay",
      "type": "MERIT_1",
      "status": "GENERATED",
      "certificateId": "CERT-2026-00001",
      "qrCodeUrl": "https://qr.pratibha.org/verify/CERT-2026-00001",
      "generatedAt": "2026-05-25T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

**Lines:** 100-150

---

### 3.5 Shipping Endpoint
**Route:** `GET /api/admin/competitions/[id]/shipping`

**Query Params:**
```
page=1
limit=10
status=ALL|PENDING|LABEL_GENERATED|IN_TRANSIT|DELIVERED
```

**Response:**
```json
{
  "data": [
    {
      "id": "ship-1",
      "registrationId": "PP-2026-REC-0021",
      "studentName": "Bhaskar Chattopadhyay",
      "shipmentId": "SHIP-2026-00001",
      "status": "IN_TRANSIT",
      "carrier": "FEDEX",
      "trackingUrl": "https://tracking.fedex.com/...",
      "estimatedDelivery": "2026-06-10T18:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

**Lines:** 100-150

---

### 3.6 Generate Certificates Endpoint
**Route:** `POST /api/admin/competitions/[id]/certificates/generate`

**Request:** `POST /api/admin/competitions/abc123/certificates/generate`

**Request Body:** (optional filters)
```json
{
  "statuses": ["PENDING"],
  "prizeTypes": ["MERIT_1", "MERIT_2", "MERIT_3"]
}
```

**Response:**
```json
{
  "message": "Generated 45 certificates successfully",
  "generatedCount": 45,
  "totalEligible": 50,
  "failedCount": 5
}
```

**Lines:** 80-120

---

### 3.7 Create Shipping Labels Endpoint
**Route:** `POST /api/admin/competitions/[id]/shipping/create-labels`

**Request:** `POST /api/admin/competitions/abc123/shipping/create-labels`

**Response:**
```json
{
  "message": "Created shipping labels for 28 shipments",
  "createdCount": 28,
  "totalPending": 28
}
```

**Lines:** 80-120

---

## 4. Type Definitions

**File:** `/src/types/competition-details.ts`

**Lines:** 100-150

```typescript
// Metadata
export interface CompetitionMetadata {
  id: string;
  title: string;
  scope: "STATE" | "NATIONAL";
  category: string;
  bannerUrl?: string;
  isActive: boolean;
  registrationDeadline: Date;
  startDate: Date;
  endDate: Date;
  totalParticipants: number;
  totalJudges: number;
}

// Sub-tab data types
export interface ParticipantRecord {
  id: string;
  registrationId: string;
  studentName: string;
  categoryName: string;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "DISQUALIFIED";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED";
  assignedJudges: { id: string; name: string; score?: number }[];
  createdAt: Date;
}

export interface VotingRecord {
  judgeId: string;
  judgeName: string;
  tier: "LOCAL" | "REGIONAL" | "NATIONAL" | "EXPERT";
  assignmentCount: number;
  submittedCount: number;
  averageScore?: number;
  isOutlier?: boolean;
  completionPercentage: number;
}

export interface CertificateRecord {
  id: string;
  registrationId: string;
  studentName: string;
  type: "PARTICIPATION" | "MERIT_1" | "MERIT_2" | "MERIT_3" | "SPECIAL_MENTION";
  status: "PENDING" | "GENERATED" | "SHARED";
  certificateId: string;
  qrCodeUrl: string;
  generatedAt: Date;
}

export interface ShippingRecord {
  id: string;
  registrationId: string;
  studentName: string;
  shipmentId?: string;
  status: "PENDING" | "LABEL_GENERATED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
  carrier?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
}

// Pagination wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Sub-tab types
export type SubTab = "participants" | "voting" | "certificates" | "shipping";
```

---

## 5. File Structure & Layout

### Directory Layout
```
src/
├── app/
│   ├── admin/dashboard/competitions/
│   │   └── [id]/
│   │       └── page.tsx                  (80-120 lines)
│   └── api/admin/competitions/
│       └── [id]/
│           ├── route.ts                  (50-80 lines: GET metadata)
│           ├── participants/route.ts      (100-150 lines)
│           ├── voting/route.ts            (100-150 lines)
│           ├── certificates/
│           │   ├── route.ts               (100-150 lines)
│           │   └── generate/route.ts      (80-120 lines)
│           └── shipping/
│               ├── route.ts               (100-150 lines)
│               └── create-labels/route.ts (80-120 lines)
│
├── components/admin/
│   ├── CompetitionDetailsLayout.tsx           (200-250 lines)
│   └── competition-details/
│       ├── ParticipantsSubTab.tsx             (250-300 lines)
│       ├── VotingSubTab.tsx                   (220-280 lines)
│       ├── CertificatesSubTab.tsx             (220-280 lines)
│       └── CourierShippingSubTab.tsx          (220-280 lines)
│
└── types/
    └── competition-details.ts             (100-150 lines)
```

### Total Lines of Code
```
API Routes:       ~950-1350 lines
Components:      ~1100-1400 lines
Types:           ~100-150 lines
Page:            ~80-120 lines
──────────────────────────────
Total:           ~2230-3020 lines
```

All files stay under 500 lines (per CLAUDE.md guidelines).

---

## 6. UI/UX Pattern & Styling

### Header Section
```tsx
<div className="flex justify-between items-center gap-4 pb-4 border-b border-terracotta/10">
  <div>
    <h1 className="font-serif text-2xl font-bold">Borsha Bodhon 2026</h1>
    <p className="text-sm text-cream/50">Manage participants, judge assignments, certificates, and shipping</p>
  </div>
  <div className="flex gap-2">
    <Badge variant="success">Active</Badge>
    <Badge variant="info">State-Level</Badge>
  </div>
</div>
```

### Sidebar Styling (matching SettingsTab)
```tsx
<button
  onClick={() => handleTabChange("participants")}
  className={`px-4 py-2.5 rounded-lg text-left text-sm font-bold transition-all ${
    activeSubTab === "participants"
      ? "bg-terracotta text-cream dark:bg-gold dark:text-charcoal shadow-sm"
      : "text-cream/60 hover:bg-cream/5 hover:text-cream"
  }`}
>
  👥 Participants
</button>
```

### Table/Content Area
- Container: `bg-charcoal-light border border-terracotta/15 rounded-2xl p-6`
- Table: Standard Tailwind grid or table element
- Loading overlay: `<Loading variant="overlay" text="Loading data..." />`
- Error banner: `p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm`
- Empty state: `text-cream/40 italic`
- Pagination: Buttons at bottom matching existing pattern

### Color Scheme
- Active elements: `bg-terracotta text-cream dark:bg-gold`
- Hover states: `hover:bg-cream/5 hover:text-cream`
- Borders: `border-terracotta/15 dark:border-terracotta/20`
- Text secondary: `text-cream/60`
- Accents: `text-gold`

---

## 7. State Management & Data Fetching

### Pattern (Participants SubTab example)
```typescript
// Local state for pagination & filtering
const [data, setData] = useState<ParticipantRecord[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [filter, setFilter] = useState("ALL");
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

// Debounce search input
useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 300);
  return () => clearTimeout(timer);
}, [search]);

// Fetch data on page/filter/search change
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        filter,
        search: debouncedSearch,
      });
      const res = await fetch(
        `/api/admin/competitions/${competitionId}/participants?${query.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch participants");
      const { data, pagination } = await res.json();
      setData(data);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  if (competitionId) fetchData();
}, [competitionId, currentPage, filter, debouncedSearch]);

// Reset to page 1 when filter/search changes
useEffect(() => {
  setCurrentPage(1);
}, [filter, debouncedSearch]);
```

---

## 8. Implementation Sequence

### Phase 1: Routing & Types (Estimated: 1-2 hours)
- [ ] Create `/src/types/competition-details.ts` with all TypeScript interfaces
- [ ] Create `/src/app/admin/dashboard/competitions/[id]/page.tsx` server component
- [ ] Create `/src/components/admin/CompetitionDetailsLayout.tsx` with URL sync logic

### Phase 2: API Endpoints (Estimated: 3-4 hours)
- [ ] Implement `/api/admin/competitions/[id]/route.ts` (metadata)
- [ ] Implement `/api/admin/competitions/[id]/participants/route.ts`
- [ ] Implement `/api/admin/competitions/[id]/voting/route.ts`
- [ ] Implement `/api/admin/competitions/[id]/certificates/route.ts`
- [ ] Implement `/api/admin/competitions/[id]/certificates/generate/route.ts`
- [ ] Implement `/api/admin/competitions/[id]/shipping/route.ts`
- [ ] Implement `/api/admin/competitions/[id]/shipping/create-labels/route.ts`

### Phase 3: Sub-Tab Components (Estimated: 4-5 hours)
- [ ] Create `ParticipantsSubTab.tsx` with table, filters, pagination
- [ ] Create `VotingSubTab.tsx` with judge assignments
- [ ] Create `CertificatesSubTab.tsx` with generation UI
- [ ] Create `CourierShippingSubTab.tsx` with tracking display

### Phase 4: Integration & Navigation (Estimated: 1-2 hours)
- [ ] Update `CompetitionsTab.tsx` to navigate to detail page on click
- [ ] Test URL sync (browser back/forward)
- [ ] Test direct linking to subtabs
- [ ] Verify all loading & error states

### Phase 5: Verification (Estimated: 1 hour)
- [ ] Run `npx tsc --noEmit` (TypeScript check)
- [ ] Run `npm run lint` (ESLint check)
- [ ] Run `npm run build` (production build)
- [ ] Manual UI testing of all 4 sub-tabs

**Total Estimated Time:** 10-14 hours

---

## 9. Industry Best Practices Applied

### Tab Organization
Follows professional competition platform patterns:
1. **Participants First** — Primary workflow is entry intake/management
2. **Voting Second** — Active phase: judge assignments and progress
3. **Certificates Third** — Post-competition: fulfillment
4. **Shipping Last** — Physical logistics for winners

This mirrors:
- UFAAQ Dashboard (entries → judging → results → fulfillment)
- 100 Humanitarians (participants → voting → certificates → recognition)
- Platform.design Competitions (submissions → jury → awards → shipping)

### Data Visibility & Workflow
- Aggregate metrics in header (total entries, judges assigned, completion %)
- Status indicators throughout (PENDING, IN_PROGRESS, COMPLETE, CONFLICT)
- Quick-action buttons for common operations
- Real-time progress indicators (completion %, average scores)
- Clear separation of concerns (each tab focuses on one workflow phase)

### Performance & UX
- Server-side pagination prevents memory bloat with large datasets
- Search & filter operate server-side for consistency
- Debounced search input (300ms) reduces API calls
- Loading spinners use unified `<Loading />` component (no custom spinners)
- Error states show in-place (no toast notifications blocking UI)
- Breadcrumbs orient users to current competition context

---

## 10. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Server-side pagination** | Matches CLAUDE.md guidelines; handles 1000+ entries efficiently |
| **URL params for subtab state** | Browser back/forward support; linkable tabs; matches SettingsTab |
| **Separate API routes per subtab** | Modular, independently testable, can scale to different databases |
| **useEffect for data fetching** | Standard React pattern; easier than server components for interactive state |
| **Client-side state only, no global state** | Lightweight; no Redux/Context needed; easier to test |
| **Inline error messages** | No toast notifications; errors shown in context where they occur |
| **Loading spinners from `<Loading />`** | Never custom spinners per CLAUDE.md; consistent with all components |
| **No client-side filtering** | All filtering happens server-side; guarantees data consistency |
| **Full TypeScript strict mode** | No `any` types; compile-time safety prevents runtime errors |
| **Modular sub-tabs (< 300 lines each)** | Easier to test, maintain, and parallelize development |

---

## 11. Error Handling & Edge Cases

### Errors Handled
- **Invalid competition ID** → Redirect to competitions list with error toast
- **API fetch failure** → Show error banner in content area
- **Empty data** → Show "No data available" message
- **Pagination bounds** → Disable prev/next buttons at boundaries
- **Unauthorized access** → Redirect to login (session handling)
- **Network timeout** → Retry button with exponential backoff

### Edge Cases
- **Search with no results** → Show "No entries match filter"
- **Page number out of range** → Reset to page 1
- **Concurrent subtab loads** → Cancel previous fetch if new tab selected
- **Rapid filter changes** → Debounce (300ms) to reduce API calls
- **Large datasets (1000+ records)** → Pagination limits to 10 per page

---

## 12. Success Criteria

### Functional Requirements ✓
- [ ] Clicking competition card navigates to `/competitions/[id]`
- [ ] Subtab buttons change active subtab and update URL
- [ ] Browser back/forward buttons work (URL sync enabled)
- [ ] Each subtab loads competition-specific data only
- [ ] Pagination works server-side (page/limit params respected)
- [ ] Filters and search work as expected
- [ ] Loading, error, and empty states display correctly

### Code Quality ✓
- [ ] All files pass `npx tsc --noEmit`
- [ ] All files pass `npm run lint`
- [ ] All files pass `npm run build`
- [ ] No `any` types in TypeScript
- [ ] No unused imports or variables
- [ ] Line count per file < 500 (per CLAUDE.md)
- [ ] Consistent with existing code style

### Performance ✓
- [ ] Page loads in < 2 seconds
- [ ] Subtab switching is instant (no reload)
- [ ] Pagination controls are responsive
- [ ] No memory leaks (cleanup useEffect dependencies)
- [ ] API responses < 5MB (large datasets paginated)

---

## 13. Future Enhancements (Out of Scope)

- [ ] Bulk operations (verify all entries, generate all certs)
- [ ] Real-time updates via WebSockets (voting progress)
- [ ] Export data to CSV (per subtab)
- [ ] Advanced filtering (date range, score range)
- [ ] Conflict detection alerts for outlier scores
- [ ] Judge performance analytics dashboard
- [ ] Print-friendly certificate view
- [ ] Automated email notifications (entries verified, certs ready, shipments dispatched)

---

## 14. Critical Dependencies

**Existing:** 
- Next.js 15+ (App Router)
- React 19+
- TypeScript 5.x
- Prisma ORM
- TailwindCSS
- NextAuth.js (session handling)

**No new dependencies required** — uses existing stack.

---

## References

- **Settings Tab Pattern:** `/src/components/admin/SettingsTab.tsx` (URL sync example)
- **Dashboard Page:** `/src/app/admin/dashboard/page.tsx` (main dashboard structure)
- **Competitions Tab:** `/src/components/admin/CompetitionsTab.tsx` (competition list display)
- **API Route Example:** `/src/app/api/admin/competitions/route.ts` (pagination pattern)
- **Memory Reference:** [[settings-tabs-url-sync]] (from .claude/projects/.../memory/)

---

## Approval & Sign-Off

**Status:** ✅ READY FOR IMPLEMENTATION

**Plan Reviewed By:** Claude Code Agent  
**Date:** 2026-05-26  
**Estimated Duration:** 10-14 hours  
**Complexity:** High (Multi-component, multi-API)

**Next Steps:**
1. User reviews and approves plan
2. Phase 1 (routing & types) begins
3. API endpoints implemented in Phase 2
4. Components created in Phase 3
5. Integration testing in Phase 4
6. Final verification with `npm run build`
