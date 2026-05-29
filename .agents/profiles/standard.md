---
id: standard
title: Standard Profile
description: Default profile for most development work
---

# Standard Profile

Default configuration for typical development work on Scout App.

## Profile Settings

| Setting | Value | Rationale |
|---------|-------|-----------|
| **Mode** | development | Allow feature work and refactoring |
| **Policy** | safe | Conservative with confirmation for risky ops |
| **Target Runtime** | Node.js + Browser | Full-stack development |
| **Strictness** | Strict TS, ESLint, tests | Prevent bugs early |
| **Optimization** | Balance (not premature) | Maintainability first |

## Enabled Capabilities

- ✅ Code generation (components, screens, forms)
- ✅ Refactoring and optimization
- ✅ Testing and debugging
- ✅ Documentation updates
- ✅ Performance profiling
- ✅ Accessibility audits

## Disabled Capabilities

- ❌ Production deployments
- ❌ Database migrations
- ❌ Environment variable changes
- ❌ Dependency purges
- ❌ Force pushes

## Development Workflow

1. Start with this profile
2. Run `npm run dev` to start dev server
3. Check relevant `skills/` files before implementation
4. Write tests alongside code
5. Run `npm run lint` before commit
6. Submit for review

## When to Switch Profiles

- **Testing**: Switch to `testing` mode for audits and coverage analysis
- **Production**: Switch to `production` mode for deployments (requires approval)
- **Aggressive**: Use when you have permission to move fast on low-risk changes
