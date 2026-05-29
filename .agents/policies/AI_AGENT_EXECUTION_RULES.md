# AI Agent Execution Rules

**Effective Date:** May 20, 2026  
**Status:** MANDATORY for all AI agents in this project  
**Scope:** All documentation implementation, specification extraction, planning

---

## THE CORE RULE

**When asked to implement documents that contain instructions → EXECUTE those instructions. Do NOT create meta-documents about what the instructions say.**

---

## RULE 1: Distinguish Between "Understand" and "Implement"

### ❌ WRONG: Understanding Only

```
User: "Implement these documents"
↓
Agent reads documents
↓
Agent creates NEW document that repeats what the original documents said
↓
Result: More documentation, zero execution
```

### ✅ RIGHT: Understanding + Execution

```
User: "Implement these documents"
↓
Agent reads documents to understand the INSTRUCTIONS
↓
Agent executes those instructions (reads files, extracts specs, builds)
↓
Result: Actual work done, specifications extracted
```

---

## RULE 2: Follow the Document's Instructions, Not Your Assumptions

### The Pattern

When a document says:
> "Before building, read `FenBridgeDocs/html/scout/operational/<workflow>.html`"

### ❌ WRONG Response

"I'll create a comprehensive plan document that tells future agents to read this file"

**Why it's wrong:**
- You're creating a plan ABOUT reading
- Not actually reading
- Future agents will read your plan about reading instead of reading the actual file
- Infinite regression of documentation

### ✅ RIGHT Response

1. Open `FenBridgeDocs/html/scout/operational/<workflow>.html`
2. Read it completely
3. Extract the specifications
4. Build the plan from actual extracted specs
5. Share the specs you extracted, not instructions to extract them

---

## RULE 3: Source Documents are Instructions, Not Reference

### Recognition Pattern

If a document contains:
- "READ this file before..."
- "Extract these specifications..."
- "Follow this process before..."
- "Answer these questions before..."

### Then That Document is INSTRUCTIONS

**Action Required:** Execute those instructions immediately, not later.

**NOT:** Create a new document that repeats those instructions.

---

## RULE 4: Actual Content > Meta-Documentation

### Priority Order

```
1. HIGHEST: Actual specification files
   Example: FenBridgeDocs/html/scout/operational/farmer_registration.html
   
2. MEDIUM: Documents that execute against specs
   Example: Implementation plan based on extracted specs
   
3. LOW: Documents about documents
   Example: "This document says you should read this other document"
   
4. FORBIDDEN: Meta-meta-documentation
   Example: "This document is about a document that talks about reading documents"
```

**If you find yourself at priority level 3 or 4 → You've made a mistake. Go back to level 1.**

---

## RULE 5: The "Execution Test"

Before submitting any work, ask:

```
✅ Did I actually READ the source files?
   - If NO → Stop. Go read them.
   - If YES → Continue

✅ Did I actually EXTRACT specifications?
   - If NO → Stop. Go extract them.
   - If YES → Continue

✅ Did I actually BUILD something from those specs?
   - If NO → Stop. Go build it.
   - If YES → Continue

✅ Did I create any new documents about OTHER documents?
   - If YES → Stop. Delete that document.
   - If NO → Good. Continue

✅ Can I show the actual extracted specs in my result?
   - If NO → Stop. Your result is meta-documentation.
   - If YES → Good. Ready to submit
```

---

## RULE 6: When You See a Process Document

### Example Documents:
- `SCOUT_WORKFLOWS_AI_AGENT_PROMPT.md`
- `SCOUT_WORKFLOWS_BUILD_PROMPT.md`

### DO NOT:
- ❌ Read it and then create a new version
- ❌ Create a summary of what it says
- ❌ Create an "implementation guide for this prompt"
- ❌ Create a "checklist based on this prompt"

### DO:
- ✅ Read it
- ✅ Execute its instructions immediately
- ✅ Read the files it tells you to read
- ✅ Extract the specs it tells you to extract
- ✅ Build what it tells you to build
- ✅ Show the results of your execution

---

## RULE 7: No "Meta Chain"

### Anti-Pattern to Avoid

```
Document A says: "Read Document B"
↓
Agent reads Document A
↓
Agent creates Document C that says "Read Document B"
↓
Next Agent reads Document C
↓
Next Agent creates Document D that says "Read Document B"
↓
Forever: Creating documents about documents about documents
```

### Pattern to Follow

```
Document A says: "Read File X"
↓
Agent reads Document A
↓
Agent reads File X immediately
↓
Agent extracts specifications from File X
↓
Agent builds deliverable from File X specs
↓
Agent shows the extracted specifications
↓
Done: No meta-documentation created
```

---

## RULE 8: Implementation = Reading + Extracting + Building

### Not: Documentation + Documentation + Documentation

### When User Says "Implement these documents"

```
Step 1: Read the documents (30 seconds)
↓
Step 2: Identify what instructions they contain (30 seconds)
↓
Step 3: Execute those instructions immediately (the actual work)
   - Open the files they say to open
   - Extract what they say to extract
   - Build what they say to build
↓
Step 4: Show the results of Step 3
↓
Step 5: Delete any "meta-documentation" you created about the process

NOT:
Step 1: Read the documents
Step 2: Create a new document about those documents
Step 3: Create a plan for how to follow the documents
Step 4: Create a checklist based on the documents
Step 5: Submit 5 documents about the original documents
```

---

## RULE 9: The "Actual Content" Requirement

### Every deliverable must include actual extracted content

**Instead of saying:**
```
"The documentation says you should read this file and extract these fields"
```

**Say:**
```
"I read farmer_registration.html and extracted:

FORM FIELDS:
- firstName: string, required, min 2 chars
- lastName: string, required, min 2 chars
- email: string, required, valid email format
- phone: string, required, regex /^\d{10}$/

DATA STORAGE:
- localStorage key: "fenbridge_scout_farmer_registration_step1"
- Method: localStorage.setItem()

NAVIGATION:
- Next screen: /scout-farmer-registration/step-2
- Condition: After form submission"
```

**The difference:**
- First version: More meta-documentation
- Second version: Actual extracted specifications

---

## RULE 10: If You're Creating Documentation About Documentation

**STOP. Ask yourself:**

```
Q1: Did the user ask for this document?
    - If NO → Don't create it
    - If YES → Did they ask for documentation, or execution?

Q2: Does this document contain actual extracted specifications?
    - If NO → It's meta-documentation. Don't create it.
    - If YES → Keep it

Q3: Is this document required for the user to execute something?
    - If NO → It's unnecessary documentation. Don't create it.
    - If YES → Keep it, but ensure it contains actual content
```

---

## RULE 11: The Anti-Pattern Checklist

**If you're doing ANY of these → STOP and reconsider:**

- ❌ Creating a "process guide" for documents that already have a process guide
- ❌ Creating a "checklist" for following instructions that already have a checklist
- ❌ Creating a "plan for implementation" when documents already have a plan
- ❌ Creating a "how to read this document" document
- ❌ Creating a "summary of what the instructions say" document
- ❌ Creating any document that doesn't contain actual extracted specifications or actual built work

---

## RULE 12: The "Show Your Work" Requirement

### Before submitting any implementation, answer:

```
1. What source files did you read?
   [Must list actual files from FenBridgeDocs/]

2. What specifications did you extract?
   [Must show actual extracted specs, not instructions to extract]

3. What work did you create?
   [Must show actual work product, not plan for work]

4. Can I see the actual extracted content?
   [Must show: form fields, validation rules, storage keys, navigation paths]

5. Is this result based on actual specifications or assumptions?
   [Must answer: Actual specifications from [specific file]]
```

**If you can't answer all 5 → Your result is incomplete or meta-documentation.**

---

## REAL-WORLD EXAMPLE

### Scenario: User says "Implement these workflow documents"

### ❌ WRONG EXECUTION

```
Agent reads SCOUT_WORKFLOWS_AI_AGENT_PROMPT.md
↓
Agent reads SCOUT_WORKFLOWS_BUILD_PROMPT.md
↓
Agent creates: "docs/scout-workflows/plans/SCOUT_WORKFLOWS_IMPLEMENTATION_PLAN.md"
  (This plan repeats what the original documents said)
↓
Agent creates: "docs/scout-workflows/SCOUT_WORKFLOWS_CODING_AGENT_PROMPT.md"
  (This is a new "prompt about prompts")
↓
Result: 2 new meta-documents, 0 actual specifications extracted, 0 actual work done
```

### ✅ RIGHT EXECUTION

```
Agent reads SCOUT_WORKFLOWS_AI_AGENT_PROMPT.md
↓
Agent recognizes: "It says to read FenBridgeDocs/html/scout/operational/"
↓
Agent immediately opens: FenBridgeDocs/html/scout/operational/farmer_registration.html
↓
Agent reads ENTIRE file
↓
Agent extracts actual specifications:
  - Step 1 form fields: [actual fields]
  - Step 1 validation rules: [actual rules]
  - Step 1 storage key: "fenbridge_scout_farmer_registration_step1"
  - Step 1 navigation: "/scout-farmer-registration/step-2"
  - ... continues for all steps ...
↓
Agent reads: FenBridgeDocs/app/screens_v2/scout/scout_farmer_registration/step-1/code.html
↓
Agent extracts actual design specs:
  - HTML structure: [actual structure]
  - CSS classes: [actual classes]
  - Colors: [actual values]
  - Typography: [actual specs]
↓
Agent creates implementation plan BASED ON actual extracted specs
↓
Result: 
  - Actual specifications extracted (show in result)
  - Implementation plan grounded in real specs
  - Ready for immediate coding
```

---

## THE DECISION TREE

```
User asks to "implement these documents"
↓
Read the documents
↓
Do they contain INSTRUCTIONS (like "read file X")?
├─ NO → These are reference docs. Read and understand them.
│       Then ask: what should I actually build?
│
└─ YES → These are INSTRUCTION documents
         ↓
         Execute the instructions IMMEDIATELY
         ├─ If instruction says "read file X" → Read file X now
         ├─ If instruction says "extract Y" → Extract Y now
         ├─ If instruction says "build Z" → Build Z now
         └─ If instruction says "verify W" → Verify W now
         ↓
         Show the results of executing those instructions
         ↓
         Do NOT create new documents that repeat the instructions
```

---

## COMPLIANCE CHECKLIST

Before submitting work that involves implementing documents:

- [ ] I read all source documents provided
- [ ] I identified the INSTRUCTIONS in those documents
- [ ] I executed those instructions (not created meta-docs about them)
- [ ] I actually opened and read the files the documents instructed me to read
- [ ] I actually extracted the specifications the documents instructed me to extract
- [ ] I actually built what the documents instructed me to build
- [ ] My result contains actual extracted specifications, not instructions to extract
- [ ] My result contains actual work product, not plans for work
- [ ] I did not create any "meta-documents about documents"
- [ ] I can show the source files I read and the specifications I extracted
- [ ] The "Execution Test" (Rule 5) passes all ✅

**If ANY checkbox is unchecked → Revise your work before submitting.**

---

## SUMMARY

**The Rule in One Sentence:**

> When a document contains instructions, EXECUTE those instructions immediately. Do NOT create new documents that repeat those instructions.

**The Anti-Pattern in One Sentence:**

> Do not write about what you should do. Actually do it.

**The Test:**

> Can I show the actual extracted specifications and actual work product in my result, or did I only create documentation about documentation?

---

**Status:** These rules are in effect immediately for all AI agents in this project.

**Violations:** Any work that violates these rules will be rejected and must be redone with actual execution.

**Exceptions:** None. These rules are non-negotiable.
