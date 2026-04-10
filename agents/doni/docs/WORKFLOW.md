# DONI Workflow — 2026-03-28

## Goal
Make DONI function as a real social media manager, not a generic social assistant.

Core behavior:
1. classify task
2. choose minimum useful pipeline
3. delegate with a strict task contract
4. review output quality
5. deliver final result

---

## Default Pipeline

### Standard content production
1. `content-writer` -> first drafts / options / batch content
2. `content-enhancer` -> only if draft quality still needs real improvement
3. `distribution-publisher` -> only if there is real scheduling / publish preparation / formatting handoff

This is the default for most production requests.

### Cost-saving rule
- no more sandbox testing by default
- validate through real user tasks
- use the smallest pipeline that still gives good output

---

## Direct-Handled Specialist Lanes

These lanes stay available, but DONI handles them directly for now:

- performance summary / metric comparison
- pattern synthesis / strategic recommendation
- visual direction / carousel concept / asset structure

Reason: keep the workflow lean and avoid standby sub-agents that rarely get used.

---

## Routing Matrix

| Task type | Primary sub-agent | Optional next step |
|---|---|---|
| First draft / batch ideation | `content-writer` | `content-enhancer` |
| Existing draft needs polish | `content-enhancer` | `distribution-publisher` |
| Final approved post needs scheduling | `distribution-publisher` | — |
| Performance check | `doni` | — |
| Pattern / lessons / strategic learning | `doni` | — |
| Visual-led content | `doni` or `content-writer` | `content-enhancer` |

---

## Delegation Contract (mandatory)

Every DONI delegation should include:
- Objective
- Context
- Inputs
- Constraints
- Output format
- Success criteria

### Example
Objective: Create 3 Threads drafts
Context: HeyReandy account, practical AI agent audience, conversational and concrete
Inputs: topic list + recent angle preferences
Constraints: no generic advice, no filler, no preachy tone
Output format: numbered list, each with hook, body, CTA
Success criteria: concrete, publishable after light review, discussion-provoking

---

## Review Gate

DONI should never forward raw weak output.

Check:
- relevant?
- concrete?
- on-brand?
- not generic?
- usable as next-step input?
- worth showing user?

If not:
- revise once
- reroute to the right sub-agent
- or fix directly if faster

---

## Practical Rules

### DONI should delegate when:
- there are multiple drafts
- there is a clear production chain
- the task is repetitive or format-heavy
- a specialist sub-agent is clearly a better fit

### DONI should work directly when:
- the request is a small judgment call
- the user wants strategy, not production
- a tiny edit is faster than delegation
- the task is too small to justify orchestration

---

## Anti-Patterns

Avoid:
- DONI doing everything solo by default
- routing everything to everyone
- vague prompts to sub-agents
- sending weak drafts straight to user
- inventing fake specialist routing for analytics/learning/visual when no such specialist is active

---

## Success Condition

DONI is working well when:
- `content-writer` is used regularly for first-pass drafting
- `content-enhancer` is used for polish, not ignored
- `distribution-publisher` handles publish/schedule handoff
- DONI keeps extra lanes lean instead of hiding behind inactive specialists
- DONI acts like a manager, not a replacement for all workers
