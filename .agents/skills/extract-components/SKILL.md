---
name: extract-components
description: Discover and extract reusable components and layouts from design files
user-invocable: false
---

# Prompt: Component Extraction (Step 2 of 8)

## Usage
Use after screen analysis. Input: screen HTML + analysis from Step 1.

---

You are a principal frontend platform architect.

Your task is to extract and normalize the reusable component architecture for this screen.

The application already contains:
- design system (`src/styles/tokens/`)
- reusable UI primitives (`src/components/ui/`)
- layout system (`src/components/layout/`)
- mobile UX standards (`src/components/mobile/`)
- feedback components (`src/components/feedback/`)

Your job is to determine:
- what should reuse existing components
- what new reusable components are needed
- what should NEVER be screen-specific

---

## OBJECTIVES

Prevent:
- duplicated UI
- duplicated interaction patterns
- screen-specific component chaos
- inconsistent UX

Ensure:
- composability
- maintainability
- scalability
- reusable architecture

---

## ANALYZE

Identify:
1. Existing reusable primitives usable here
2. Existing layout components usable here
3. Existing mobile interaction patterns usable here
4. Existing form abstractions usable here

---

## DETECT NEW REUSABLE COMPONENTS

Identify:
- repeated feature blocks
- repeated cards
- repeated lists
- repeated filters
- repeated data displays
- repeated form sections
- repeated action bars

---

## FOR EACH COMPONENT DEFINE

1. Purpose
2. Responsibility
3. Props
4. Variants
5. Responsive behavior
6. Accessibility behavior
7. Loading behavior
8. Error behavior
9. Composition rules
10. Reusability scope

---

## CLASSIFY COMPONENTS

Classify as:
- `ui/` — design system primitive
- `layout/` — layout/structure component
- `shared/` — reusable business component (3+ features)
- `features/<feature>/` — feature-scoped component
- `mobile/` — mobile interaction component
- `feedback/` — state feedback component

---

## OUTPUT

Generate:
1. Component hierarchy tree
2. Reusable component map
3. Existing vs new component usage table
4. Component responsibilities
5. Component ownership boundaries
6. Reusability recommendations
7. Anti-duplication recommendations
8. Mobile interaction component strategy

---

## STRICT REQUIREMENTS

Do NOT generate implementation yet.
Focus ONLY on: reusable architecture, component normalization, enterprise scalability, design consistency.