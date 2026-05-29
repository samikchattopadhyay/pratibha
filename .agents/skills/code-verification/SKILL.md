---
name: code-verification
description: Verify code changes against actual behavior before confirming they're complete
user-invocable: false
---

# Code Verification Skill

## Overview

Proper code verification prevents false confirmations and wasted debugging cycles. Before confirming any code change is complete, verify it handles the actual test cases the user mentioned.

## Three Core Steps

### 1. Read the Full Condition

Don't inspect partial code. Read the COMPLETE logic:

```typescript
// ❌ DON'T stop here
const isPopperRegistrationPage = pathname.startsWith("/scout/popper-registration/step-");

// ✅ DO read the full condition with all clauses
const isPopperRegistrationPage = pathname === "/scout/register-popper" 
  || pathname.startsWith("/scout/popper-registration/step-") 
  || pathname.includes("/scout/popper-registration/confirmation");
```

### 2. Trace Through It With the Actual URL You're On

When the user says they tested at a specific URL, verify the code handles that exact URL:

```typescript
// User tested at: /scout/register-popper

const condition = pathname === "/scout/register-popper" 
  || pathname.startsWith("/scout/popper-registration/step-") 
  || pathname.includes("/scout/popper-registration/confirmation");

// Trace: 
// - Does "/scout/register-popper" === "/scout/register-popper"? YES ✅
// - Code handles this case ✅
```

vs.

```typescript
// User tested at: /scout/register-popper

const condition = pathname.startsWith("/scout/popper-registration/step-");

// Trace:
// - Does "/scout/register-popper" start with "/scout/popper-registration/step-"? NO ❌
// - Code does NOT handle this case ❌
// - Condition is incomplete, needs fix
```

### 3. Verified It Matched Before Confirming It's Done

Never confirm code is working without verifying the specific case the user mentioned.

**The Verification Checklist:**
- [ ] Read the complete condition/logic
- [ ] Know the exact URL/case tested
- [ ] Traced that URL through the condition
- [ ] Confirmed the URL matches
- [ ] Verified ALL test cases mentioned

## When Verification Fails

If the code doesn't handle the user's test case:

**DON'T:** Confirm it's done anyway
**DO:** 
1. Identify what's missing
2. Explain why it didn't work
3. Provide the fix
4. Verify the fix handles the case

---

## Common Verification Mistakes

### ❌ Assuming Based on Partial Code
```
"I see the condition exists → It must be working"
Without actually tracing the URL through it
```

### ❌ Not Knowing the Test URL
```
Confirming code works without knowing what the user actually tested
```

### ❌ Confirming Without Tracing
```
"Yes, the condition handles it" 
Without manually checking if the specific URL matches
```

### ❌ Only Checking One Case
```
Verifying the multi-page routes work
But not checking the old wizard route
```

---

## The Right Approach

```
User: "I still see the footer on /scout/register-popper"
↓
Read complete condition
↓
Trace URL: Does "/scout/register-popper" match the condition?
↓
Answer: No, the condition only covers "/scout/popper-registration/step-*"
↓
Conclusion: Code is incomplete
↓
Action: Add "/scout/register-popper" to condition
↓
Verify: Now does "/scout/register-popper" match? YES ✅
↓
Confirm: "Fixed - added the missing route"
```

---

## Verification Tools

When verifying code:

1. **Read the full file** — Don't stop at the first relevant lines
2. **Extract the complete logic** — Copy the full condition/function
3. **Know the test case** — What exact URL/input was being tested
4. **Manually trace** — Step through with the actual test value
5. **Confirm match** — Does the value match the logic?

---

## Red Flags (Stop and Recheck)

🚩 Confirming code without reading the full condition
🚩 Not knowing what the user actually tested
🚩 Tracing code mentally without actually writing it out
🚩 Assuming partial code inspection is enough
🚩 Saying "yes" when you should say "the code is incomplete"

---

## Summary

**Before confirming code is done:**
1. Read the FULL condition
2. Trace through with the ACTUAL test URL
3. Verify it MATCHED

**If any of these fail → the work is incomplete**
