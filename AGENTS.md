# Pratibha Parishad - Agent Configuration

Entry point for AI agents working on Pratibha Parishad. For detailed guidance, see `.agents/` directory.

## Start Here

1. **Full Context** → [`.agents/prompts/project.md`](.agents/prompts/project.md)
2. **Core Principles** → [`.agents/prompts/base.md`](.agents/prompts/base.md)
3. **Task-Specific** → [`.agents/skills/`](.agents/skills/)

## Configuration Files

| File | Purpose |
|------|---------|
| [`.agents/manifest.yaml`](.agents/manifest.yaml) | Spec configuration and defaults |
| [`.agents/modes/development.md`](.agents/modes/development.md) | Feature work mode |
| [`.agents/modes/testing.md`](.agents/modes/testing.md) | Testing and audits mode |
| [`.agents/modes/production.md`](.agents/modes/production.md) | Production operations mode |
| [`.agents/policies/safe.md`](.agents/policies/safe.md) | Conservative safety policy (default) |
| [`.agents/policies/aggressive.md`](.agents/policies/aggressive.md) | Permissive policy (when authorized) |
| [`.agents/profiles/standard.md`](.agents/profiles/standard.md) | Default development profile |

## Project Summary

- **Type:** Talent Competition Management Portal
- **Stack:** Next.js (App Router), React 19, TypeScript, TailwindCSS
- **Backend:** Prisma ORM + PostgreSQL Database
- **Authentication:** NextAuth.js (Credentials, JWT)
- **Roles:** Super Admin/Moderator, Judge, Parent/Student

## Key Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run lint      # Code quality checks
```

## Current Mode & Policy

**Mode:** development (default)  
**Policy:** safe (default)

See [`.agents/modes/`](.agents/modes/) and [`.agents/policies/`](.agents/policies/) to understand constraints.

## Additional Context

- **Architecture:** [CLAUDE.md](CLAUDE.md) (project philosophy)
- **Documentation:** [docs/](docs/)
- **Legacy Guidance:** [`.agents/context/AGENT.md`](.agents/context/AGENT.md)
- **Skills:** [`.agents/skills/`](.agents/skills/) (task-specific instructions)
- **Windows Dev Performance:** [`.agents/skills/windows-dev-performance/SKILL.md`](.agents/skills/windows-dev-performance/SKILL.md) (Next.js performance tuning on Windows 11)

---

**This file follows the [.agents specification](https://github.com/agentsfolder/spec). Last updated: 2026-05-24**
