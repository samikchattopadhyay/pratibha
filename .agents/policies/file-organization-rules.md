# File Organization Rules for AI Agents

## Core Rule: No Markdown Files in Project Root

**Never create markdown files directly in the project root directory.**

All documentation and configuration files must be organized in proper subdirectories.

---

## File Location Rules

### Documentation & Guide Files
**Location:** `docs/<relevant-subfolder>/`

**Examples:**
- `docs/scout-workflows/SCOUT_WORKFLOWS_AI_AGENT_PROMPT.md`
- `docs/scout-workflows/implementation-guide.md`
- `docs/api/REST-endpoints.md`
- `docs/architecture/component-hierarchy.md`

**Action if subfolder doesn't exist:**
- Create it first, then create the markdown file inside

### Policy & Rules Files
**Location:** `.agents/policies/`

**Examples:**
- `.agents/policies/build-from-specs-not-assumptions.md`
- `.agents/policies/html-css-reuse-from-mockups.md`
- `.agents/policies/file-organization-rules.md`

**Action if subfolder doesn't exist:**
- Create it first, then create the file

### Agent Configuration Files
**Location:** `.agents/`

**Examples:**
- `.agents/manifest.yaml`
- `.agents/prompts/scout-builder.md`
- `.agents/modes/spec-first.yaml`

---

## Project Root Exception

**These are allowed in project root:**
- `package.json`
- `tsconfig.json`
- `next.config.js`
- `.env.local`
- `README.md` (project overview only)
- `.gitignore`, `.npmrc`, etc. (configuration files)

**NOT allowed in project root:**
- Feature documentation
- Workflow guides
- Build instructions
- Process documentation
- Agent prompts

---

## File Organization Structure

```
fenbridge/
├── docs/                              # All documentation
│   ├── scout-workflows/               # Scout workflow documentation
│   │   ├── SCOUT_WORKFLOWS_AI_AGENT_PROMPT.md
│   │   ├── implementation-guide.md
│   │   └── workflows-reference.md
│   ├── api/                           # API documentation
│   │   ├── REST-endpoints.md
│   │   └── authentication.md
│   ├── architecture/                  # Architecture & design docs
│   │   ├── component-hierarchy.md
│   │   ├── state-management.md
│   │   └── data-flow.md
│   ├── guides/                        # Development guides
│   │   ├── getting-started.md
│   │   └── contributing.md
│   └── design-system/                 # Design system documentation
│       └── design-tokens.md
├── .agents/                           # Agent configuration
│   ├── manifest.yaml
│   ├── policies/                      # Agent policies & rules
│   │   ├── build-from-specs-not-assumptions.md
│   │   ├── html-css-reuse-from-mockups.md
│   │   ├── read-workflow-documentation.md
│   │   ├── file-organization-rules.md
│   │   └── (other policies)
│   ├── prompts/                       # Agent prompts
│   │   └── scout-builder.md
│   ├── modes/                         # Agent modes
│   │   └── spec-first.yaml
│   └── profiles/                      # Agent profiles
│       └── (profiles as needed)
├── src/                               # Source code
├── FenBridgeDocs/                     # External design/spec docs
├── README.md                          # Project overview
└── package.json
```

---

## Workflow: Creating New Documentation

### When you need to create a new documentation file:

1. **Identify the category** (scout-workflows, api, architecture, guides, design-system)
2. **Check if folder exists** in `docs/<category>/`
   - If YES → Create file inside
   - If NO → Create folder first, then create file
3. **Name the file clearly** (use hyphens for spaces, .md extension)
4. **Don't create in project root** (this is the key rule)

### Example Workflow

**Task:** Create documentation for Farmer workflow implementation

1. Check if `docs/farmer-workflows/` exists → NO
2. Create folder: `docs/farmer-workflows/`
3. Create file: `docs/farmer-workflows/farmer-registration-guide.md`
4. Write documentation inside

---

## Enforcement

**Before creating ANY markdown file:**

- [ ] Is this documentation, guide, policy, or configuration?
- [ ] Is the destination folder correct?
- [ ] Does the destination folder exist?
- [ ] Am I putting this in project root? (NO - this is wrong)
- [ ] Am I organizing by topic/category? (YES - good)

**If you create a markdown file in project root, it will be moved to the correct location and the rule will be reinforced.**

---

## Why This Rule Exists

- **Maintainability:** Organized structure is easier to navigate
- **Clarity:** Clear folder names indicate content purpose
- **Scalability:** As documentation grows, organization prevents chaos
- **Professionalism:** Well-organized projects look and function better
- **Search:** Clear folder structure makes finding docs faster

---

**Status:** Active Rule - All markdown files must follow file organization rules. No exceptions.
