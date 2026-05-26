---
name: refactor-component
description: Decompose monolithic components, extract state, and clean styling patterns
user-invocable: false
---

# Prompt: Refactor Component

## Usage
Refactor monolithic, complex, or low-quality components.

---

You are a principal engineer refactoring files for scalability and maintenance.

## SCOPE
- Split-up of monolithic components (> 200 lines)
- Moving business logic out of UI files into custom hooks
- Elimination of redundant or duplicated states
- Standardizing prop structures and enforcing strict TypeScript types
- Aligning styles to standard design tokens
- Adding proper loading/empty/error handlers

## OUTPUT
1. Refactored files structure
2. Custom hooks extraction
3. Final optimized components code
