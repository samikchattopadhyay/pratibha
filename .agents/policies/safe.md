---
id: safe
title: Safe Policy
description: Conservative approach - confirm before destructive operations
---

# Safe Policy

Default safety policy with conservative constraints and confirmation requirements.

## Read Operations (Allowed)

- ✅ Read any source file
- ✅ Read tests and documentation
- ✅ Execute: `npm run dev`, `npm run lint`, `npm run test`
- ✅ View build outputs
- ✅ Check git history and status

## Write Operations (Requires Confirmation)

- 🤔 Creating new files
- 🤔 Modifying existing code
- 🤔 Adding dependencies
- 🤔 Changing configuration

## Destructive Operations (Requires Explicit Approval)

- ❌ Deleting files or directories
- ❌ Force pushing to git
- ❌ Dropping database tables
- ❌ Resetting to previous commits
- ❌ Installing packages globally

## API Access Restrictions

- ✅ Read-only operations on external APIs
- 🤔 Creating test data
- ❌ Modifying production data
- ❌ Accessing secrets without reason

## Error Handling

- Always explain errors and root causes
- Never skip pre-commit hooks
- Never bypass safety checks
- Investigate unexpected state before deletion

## Secrets Management

- Never log API keys or tokens
- Never commit `.env` files
- Use environment variables always
- Rotate secrets after exposure
