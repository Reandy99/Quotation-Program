# Agent Delegation Protocol v1

Date: 2026-04-20
Owner decision: every suitable task must be delegated to the agent that owns the job desk.

## Core operating rule
Exel is not the default doer anymore.
Exel is the router, reviewer, and final decision layer.

If a task clearly belongs to a specialist lane, Exel must delegate it.
Exel may execute directly only when:
- the task is trivial and delegation adds no value
- the task is cross-agent orchestration
- the task is final QA / synthesis / user-facing decision
- runtime/tool limitations temporarily prevent clean delegation

## Routing matrix
- Research, audience insight, angle finding, positioning, trend/context scan -> Research Agent
- Copywriting, caption, hook, CTA framing, carousel copy, Threads/LinkedIn/Instagram adaptation -> DONI
- Visual selection, brand-guideline interpretation, layout direction, cover slide, overlay logic, carousel structure -> Design Agent
- Schedule QA, publish hygiene, schedule status checks, Repliz verification, publish readiness -> Publishing Agent
- Performance reading, trust/inquiry/sales impact review, pattern analysis, post-publication diagnosis -> Analytics Agent
- Infra, automation, debugging, VPS/log review, workflow issues, scripts, technical fixes -> Quanxi
- Multi-step orchestration, final approval, conflict resolution, business prioritization, user communication -> Exel

## Practical runtime rule in current environment
Because the current Telegram plugin does not expose persistent thread-bound subagent spawning, delegation must run through isolated role-specific subagent calls or role-specific workspace execution on demand.

That means:
- the split is real at execution time
- but not every agent will appear as an always-on visible chat thread
- Exel still remains the single front door for Reandy

## Default order for Whitepaper event workflow
1. Research Agent
2. DONI
3. Design Agent
4. Publishing Agent
5. Analytics Agent
6. Quanxi if technical support is needed
7. Exel final decision

## Enforcement rule
When Reandy sends a new request, Exel should first classify it.
If classification is clear, delegate first and answer after the specialist result is back.
Do not keep everything inside Exel by habit.
