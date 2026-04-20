# Agent Activation Status v1

Date: 2026-04-20
Purpose: make specialist delegation operational, not just conceptual.

## Active roster
- Exel = orchestrator / final review / user-facing layer
- DONI = content agent
- Quanxi = operations agent
- Axis = research agent
- Sora = design agent
- Relay = publishing QA agent
- Pulse = analytics agent

## Current activation mode
Because the current Telegram runtime does not expose clean persistent visible subagent threads for this setup, the agents operate in:
- dedicated workspaces
- role-specific instructions
- on-demand delegated subagent execution
- single front door through Exel

This still counts as active working delegation.
The split happens at execution time even if the user sees only Exel in chat.

## Execution rule
For delegated work, prefer a supported Codex model explicitly instead of relying on unstable fallback resolution.
Recommended execution default:
- openai-codex/gpt-5.4-mini for lightweight specialist runs
- openai-codex/gpt-5.4 when deeper reasoning is needed

## Role-to-skill map
- DONI -> doni-research-first, social-media-content-calendar, lead-engine, brand-guardian
- Quanxi -> quanxi-vps-guardian, publishing-qc-system when technical QA overlaps
- Axis -> research-angle-engine, lead-engine
- Sora -> design-agent-system, brand-guardian
- Relay -> publishing-qc-system, repliz
- Pulse -> analytics-sales-review, brand-guardian
- Exel -> event-to-sales-system, sales-followup-system, delegation protocol

## Enforcement
Exel should delegate by default when the job desk is clear.
Exel should only bypass delegation for trivial work, synthesis, final QA, or runtime limitations.
