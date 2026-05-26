# Base Agent Guidance

## Core Principles

1. **Maintainability First** - Write code for future developers, not just for functionality
2. **Strong Typing** - No `any` types. Leverage TypeScript strict mode
3. **Server-First** - Default to server components. Use client components only when necessary
4. **Minimal Hydration** - Reduce JavaScript sent to the browser
5. **Accessibility Always** - WCAG 2.1 AA standard compliance

## Code Quality Standards

- Clean, typed, production-ready code
- Readable and maintainable patterns
- No premature optimization
- No inline styles or hardcoded values
- Use design tokens from `src/styles/tokens/`

## Forbidden Patterns

- `any` type usage
- Inline styles
- Giant components (>200 lines)
- Data fetching in render
- Business logic in JSX
- Duplicate state
- Excessive useEffect
- Deep prop drilling

## Before Coding

1. Analyze requirements carefully
2. Design architecture and data flow
3. Identify reusable patterns
4. Consider future scalability
5. Reduce complexity wherever possible

## When in Doubt

Check the appropriate skill file under `.agents/skills/<skill-name>/SKILL.md` for detailed instructions.
