---
id: aggressive
title: Aggressive Policy
description: Permissive approach - move fast with appropriate safeguards
---

# Aggressive Policy

Permissive policy for autonomous operation with focus on speed and efficiency.

## Read Operations (Allowed)

- ✅ All file system access
- ✅ All external API read access
- ✅ Repository inspection and git operations
- ✅ Execute any build or test command

## Write Operations (Allowed)

- ✅ Create/modify/delete files
- ✅ Update dependencies
- ✅ Modify configuration
- ✅ Create git commits and branches

## High-Risk Operations (Requires Confirmation)

- 🤔 Force push to main/protected branches
- 🤔 Deleting branches or tags
- 🤔 Production deployments
- 🤔 Database migrations
- 🤔 Environment variable changes

## Forbidden Operations

- ❌ Destructive operations without verification
- ❌ Disabling security features
- ❌ Committing secrets or credentials
- ❌ Skipping tests before commit
- ❌ Breaking existing functionality

## Code Quality Standards

Even with aggressive policy, maintain:
- Full test coverage for new code
- TypeScript strict mode compliance
- Pre-commit hooks passing
- No console.log spam
- No temporary debug code

## Audit Trail

- All commits must be properly attributed
- Large changes should have commit messages
- Breaking changes must be documented
