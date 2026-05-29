---
name: library-decision-rule
description: Mandatory rule - Must ask user permission before any library changes
metadata:
  type: feedback
  severity: critical
  enforced: always
---

# LIBRARY DECISION RULE - MANDATORY

**🚨 CRITICAL REQUIREMENT:**

You MUST ask explicit permission from the user BEFORE:
- Installing any new library or package
- Switching from one library to another (e.g., Google Maps → Leaflet)
- Removing or uninstalling any library
- Changing the implementation of any existing library
- Making architectural decisions about dependencies

## Why This Matters

Library decisions have cascading effects on:
- Project dependencies and bundle size
- Build configuration and setup
- Future maintenance and compatibility
- Team knowledge and expertise
- Lock files and reproducible builds

## The Rule

**BEFORE** making ANY library decision:
1. Inform the user of the problem/need
2. Propose the library change with reasoning
3. **WAIT FOR EXPLICIT APPROVAL**
4. Only proceed after user confirms

## What Counts as a Library Decision

- Installing npm packages
- Replacing one solution with another (e.g., maps, state management, forms)
- Removing or downgrading packages
- Changing integration approach (CDN vs npm, different provider)
- Any decision that affects `package.json` or imports

## Examples

❌ **WRONG:** "Google Maps API isn't working, let me install Leaflet" → Just do it
✅ **RIGHT:** "Google Maps API isn't working. I can either fix the API key or switch to Leaflet (open-source, no auth required). Which would you prefer?"

❌ **WRONG:** "I'll add this UI library to speed up development" → Just install it
✅ **RIGHT:** "To speed up this task, I could use shadcn/ui component library. Should I add it?"

## Undo Protocol

If you make a library decision without permission:
- DO NOT silently revert it later
- DO NOT remove it without asking
- Acknowledge the mistake and get permission before undoing

The user may want to keep the change you made, even if it wasn't approved initially.

## No Exceptions

This rule applies to:
- All libraries, packages, and dependencies
- All project types and contexts
- All team members and agents
- Every single time, no shortcuts
