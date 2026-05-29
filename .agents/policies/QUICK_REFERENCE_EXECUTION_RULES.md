# AI Agent Execution Rules - Quick Reference

**TL;DR:** Execute instructions. Don't document the instructions.

---

## The Core Rules (30 seconds)

| ✅ DO | ❌ DON'T |
|------|---------|
| Read source documents | Create new documents about source documents |
| Execute their instructions | Create meta-documentation |
| Extract actual specifications | Create plans about the plans |
| Show actual work product | Create "implementation guides" for existing guides |
| Read the files they say to read | Document what you're going to read |
| Show extracted specifications | Describe how to extract specifications |

---

## When User Says "Implement These Documents"

### Step 1: READ (30 seconds)
```
Open and read:
- SCOUT_WORKFLOWS_AI_AGENT_PROMPT.md
- SCOUT_WORKFLOWS_BUILD_PROMPT.md
```

### Step 2: IDENTIFY INSTRUCTIONS (30 seconds)
```
Extract the instructions these documents contain:
- "Read FenBridgeDocs/html/scout/operational/"
- "Extract form fields, validation, storage, navigation"
- "Build implementation plan from actual specs"
```

### Step 3: EXECUTE IMMEDIATELY (the actual work)
```
DO THIS NOW:
✅ Open FenBridgeDocs/html/scout/operational/farmer_registration.html
✅ Read it completely
✅ Extract actual specifications
✅ Show what you extracted
✅ Build work product from those specs

DO NOT DO THIS:
❌ Create a new document about reading
❌ Create a plan for extraction
❌ Document the process
❌ Write meta-guides
```

### Step 4: SHOW THE RESULTS
```
Your result should contain:
✅ Extracted form fields (actual)
✅ Extracted validation rules (actual)
✅ Extracted storage keys (actual)
✅ Extracted navigation paths (actual)
✅ Work product (actual)

NOT:
❌ Instructions about extraction
❌ Plans for implementation
❌ Guides about guides
```

---

## The Execution Test (Before Submitting)

```
✅ Did I actually READ source files?
✅ Did I actually EXTRACT specifications?
✅ Did I actually BUILD work product?
✅ Does my result show actual extracted content?
✅ Did I avoid creating meta-documentation?

If ANY = NO → Revise before submitting
```

---

## Anti-Pattern Examples

### ❌ Wrong: Meta-Documentation Chain

```
User: "Implement these documents"
↓
Agent creates: "Implementation Plan for Documents"
↓
Agent creates: "Coding Agent Prompt for Implementation Plan"
↓
Agent creates: "Guidelines for Coding Agent Prompt"
↓
Agent creates: "Instructions for Guidelines"
↓
∞ Meta-documentation forever
```

### ✅ Right: Direct Execution

```
User: "Implement these documents"
↓
Agent reads documents
↓
Agent executes the instructions in them
↓
Agent reads FenBridgeDocs/html/scout/operational/farmer_registration.html
↓
Agent extracts: [form fields, validation, storage, navigation]
↓
Agent builds: [implementation plan from actual specs]
↓
Agent shows: [extracted specifications in result]
↓
Done
```

---

## The One Question Test

**Before submitting your work, ask:**

> "Can I show the actual extracted specifications and actual work product in my result, or did I only create documentation about documentation?"

- **If:** "I can show actual extracted content" → ✅ Good to submit
- **If:** "I created guides/plans/documentation about what to do" → ❌ Revise

---

## Recognition: You're Creating Meta-Documentation If...

```
❌ You're writing about "how to read documents"
❌ You're creating "implementation guides" for existing guides
❌ You're documenting "what the instructions say"
❌ You're creating "checklists for following instructions"
❌ You're writing "process guides" for processes already documented
❌ You're creating "summaries of documents"
❌ You can't show actual extracted specifications in your result
```

---

## The Fix: Just Execute

```
Instead of:
"This document says you should read this file..."

Do this:
1. Open the file
2. Read it completely
3. Extract the actual specifications
4. Show what you extracted
5. Build from those specs
```

---

## Compliance Before Submitting

- [ ] No meta-documentation created?
- [ ] Actual source files read?
- [ ] Actual specifications extracted?
- [ ] Actual work product created?
- [ ] Extracted specifications visible in result?
- [ ] Result shows: "Extracted from [actual file]"?

**All ✅? Ready to submit.**

---

**One Rule:** Execute instructions. Don't document them.

See full rules: `.agents/policies/AI_AGENT_EXECUTION_RULES.md`
