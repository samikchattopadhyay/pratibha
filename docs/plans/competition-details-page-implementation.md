# Competition Details Page Implementation Plan

## Objective
Create a dedicated competition details page with 4 sub-tabs (Participants, Live Voting, Certificates, Courier & Shipping) that display competition-specific data only, following industry best practices and the Settings page pattern.

## Requirements Analysis

### Functional Requirements
1. **URL-Synced Sub-Tabs**: Similar to Settings page, using URL parameters to maintain tab state
2. **Browser History Support**: Back/forward buttons should navigate between tabs
3. **Competition-Specific Data Only**: Each API endpoint must filter by competitionId - no client-side filtering
4. **Server-Side Pagination**: All lists must use database-level skip/take
5. **Real-Time Data**: Each tab shows live data for the selected competition

### Sub-Tabs Design

#### 1. Participants
- **Data Displayed**:
  - Registration ID, Student Name, Category, Status, Payment Status, Assigned Judges
- **Features**:
  - Debounced search (300ms) for student/registration ID
  - Status filters (ALL, PENDING_VERIFICATION, VERIFIED, REJECTED, DISQUALIFIED)
  - Server-side pagination (10 items/page)
  - Summary metrics (total participants, verification status breakdown)
- **API**: `GET /api/admin/competitions/[id]/participants?page=X&limit=10&filter=STATUS&search=QUERY`

#### 2. Live Voting
- **Data Displayed**:
  - Judge assignments and scoring progress
  - Judge name, tier, assignment count, submitted count, average score, completion %
- **Features**:
  - Server-side pagination (10 judges/page)
  - Color-coded completion status (complete/in-progress/pending)
  - Progress indicators
  - Summary metrics
- **API**: `GET /api/admin/competitions/[id]/voting?page=X&limit=10`
- **Layout**: Grid of judge cards (not table) showing completion progress

#### 3. Certificates
- **Data Displayed**:
  - Certificate ID, Student Name, Type, Status, Generation Date
- **Features**:
  - Status filters (ALL, PENDING, GENERATED, SHARED)
  - Bulk "Generate Certificates" button for VERIFIED entries
  - Server-side pagination (10 items/page)
  - Summary metrics (total, pending, generated, shared counts)
- **API**: 
  - `GET /api/admin/competitions/[id]/certificates?page=X&limit=10&status=STATUS`
  - `POST /api/admin/competitions/[id]/certificates/generate` - bulk generation

#### 4. Courier & Shipping
- **Data Displayed**:
  - Registration ID, Student Name, Shipment Status, Carrier, AWB Number, ETA
- **Features**:
  - Status filters (ALL, PENDING, LABEL_GENERATED, PICKED_UP, IN_TRANSIT, DELIVERED)
  - Bulk "Create Shipping Labels" button for PENDING shipments
  - Clickable tracking links
  - Server-side pagination (10 items/page)
  - Summary metrics (total, pending, in-transit, delivered counts)
- **API**:
  - `GET /api/admin/competitions/[id]/shipping?page=X&limit=10&status=STATUS`
  - `POST /api/admin/competitions/[id]/shipping/create-labels` - bulk label generation

## Architecture

### File Structure
```
src/
├── app/
│   ├── admin/dashboard/competitions/[id]/
│   │   └── page.tsx (Server component - fetches metadata, renders layout)
│   └── api/admin/competitions/[id]/
│       ├── route.ts (GET - metadata endpoint)
│       ├── participants/route.ts (GET - paginated participants)
│       ├── voting/route.ts (GET - judge assignments & scores)
│       ├── certificates/
│       │   ├── route.ts (GET - paginated certificates)
│       │   └── generate/route.ts (POST - bulk generate)
│       └── shipping/
│           ├── route.ts (GET - paginated shipments)
│           └── create-labels/route.ts (POST - bulk label creation)
├── components/admin/
│   ├── CompetitionDetailsLayout.tsx (Client - manages tab state & URL sync)
│   └── competition-details/
│       ├── ParticipantsSubTab.tsx
│       ├── VotingSubTab.tsx
│       ├── CertificatesSubTab.tsx
│       └── CourierShippingSubTab.tsx
└── types/
    └── competition-details.ts (Shared TypeScript interfaces)
```

### Design Patterns

#### 1. URL Synchronization Pattern (Settings-inspired)
- Use `useSearchParams()` to read current tab from URL
- On tab change: `window.history.replaceState()` to update URL
- Supports browser back/forward navigation
- Query param: `?subtab=participants|voting|certificates|shipping`

#### 2. Server-Side Data Filtering
- All API routes filter by `competitionId` at database level
- Query parameters: `page`, `limit`, optional `filter`/`search`
- Return paginated response: `{ data: [], pagination: { totalCount, totalPages, currentPage, limit } }`

#### 3. Component Composition
- Server page: Fetches competition metadata, validates access
- Client layout: Manages tab state, renders sidebar
- Sub-tab components: Autonomous data fetching with their own state
- Loading states: Use unified `<Loading />` component

## UI/UX Principles (Industry Best Practices)

### Visual Hierarchy
- **Main tabs** (left sidebar): Primary navigation with active state highlighting
- **Filters/Actions** (top of content area): Secondary controls
- **Data table/grid**: Consistent with rest of application
- **Metrics**: Summary section at bottom for quick insights

### Interaction Patterns
1. **Pagination**: Previous/Next buttons + numbered page selector (7-page limit)
2. **Filtering**: Toggle buttons for status, debounced text search
3. **Bulk Actions**: Primary button (Generate, Create Labels) at top
4. **Status Indicators**: Color-coded badges (green=complete, yellow=pending, red=failed)

### Color Scheme
- **Background**: Charcoal (#2a2a2a)
- **Cards**: Charcoal Light (#3a3a3a)
- **Accent**: Terracotta (#c97a5f)
- **Highlight**: Gold (#d4af37)
- **Status Colors**: Green (success), Yellow (pending), Red (error)

## Implementation Checklist

### Phase 1: Setup
- [ ] Create type definitions in `/types/competition-details.ts`
- [ ] Create server page at `/app/admin/dashboard/competitions/[id]/page.tsx`
- [ ] Create layout component at `/components/admin/CompetitionDetailsLayout.tsx`

### Phase 2: API Routes
- [ ] `GET /api/admin/competitions/[id]` - Competition metadata
- [ ] `GET /api/admin/competitions/[id]/participants` - Paginated participants with search/filter
- [ ] `GET /api/admin/competitions/[id]/voting` - Judge assignments & scores
- [ ] `GET /api/admin/competitions/[id]/certificates` - Paginated certificates
- [ ] `POST /api/admin/competitions/[id]/certificates/generate` - Bulk certificate generation
- [ ] `GET /api/admin/competitions/[id]/shipping` - Paginated shipments
- [ ] `POST /api/admin/competitions/[id]/shipping/create-labels` - Bulk label creation

### Phase 3: Sub-Tab Components
- [ ] `ParticipantsSubTab.tsx` - Table with search, filters, pagination, metrics
- [ ] `VotingSubTab.tsx` - Grid of judge cards with progress indicators
- [ ] `CertificatesSubTab.tsx` - Table with status filters, bulk action, metrics
- [ ] `CourierShippingSubTab.tsx` - Table with status filters, tracking links, bulk action

### Phase 4: Integration & Navigation
- [ ] Update `CompetitionsTab.tsx` to navigate to competition details
- [ ] Test URL synchronization and browser history
- [ ] Test pagination across all tabs
- [ ] Test filters and search functionality

### Phase 5: Verification
- [ ] TypeScript strict mode: `npx tsc --noEmit`
- [ ] ESLint: `npm run lint`
- [ ] Production build: `npm run build`
- [ ] Manual testing: Navigate, filter, paginate, go back/forward

## Security & Authorization
- All API routes require `SUPER_ADMIN` or `MODERATOR` role
- Session validation on all endpoints
- Competition ID validated against user's accessible competitions

## Performance Considerations
- Server-side pagination prevents large data transfers
- Debounced search reduces unnecessary API calls
- Database indexes on `competitionId`, `status`, `registrationId`
- Lazy loading of sub-tabs (only fetch when tab is opened)

## Error Handling
- Network errors: Display error banner with retry option
- Empty states: Show contextual "No data" message
- Loading states: Use `<Loading />` overlay for async operations
- Validation: Handle invalid competitionId, redirect to competitions list

