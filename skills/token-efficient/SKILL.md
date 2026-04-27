---
name: token-efficient
description: Guidance for minimizing token usage in OpenClaw interactions. Use when you want to reduce context load, avoid unnecessary file reads, or optimize agent turns for efficiency.
---

# Token Efficient

## Core Principles

Follow OpenClaw's context tiering system to minimize token consumption:

**Tier 0 (zero context)**: Default state. Do not read files or memory. Ask 1 clarification if needed.
**Tier 1 (memory lookup)**: Only if user references past actions/decisions. Use memory_search, then memory_get for exact snippet.
**Tier 2 (targeted file lookup)**: Only if user references specific file/config/code. Read smallest relevant excerpt.
**Tier 3 (heavy)**: Audits/multi-file reviews. Confirm scope before loading many files.

## Practical Guidelines

1. **Start light**: Begin with no file reads. Ask clarifying questions if the request is ambiguous.
2. **Use memory search**: When user mentions past work, search memory first before reading files.
3. **Targeted reads**: If file reference is given, read only the needed section with offset/limit.
4. **Leverage agent roles**: Route to appropriate specialist agents (Axis, Doni, Sora, etc.) instead of doing everything yourself.
5. **Batch operations**: Combine related file operations when possible.
6. **Prefer built-in knowledge**: Use your existing training before consulting external sources.

## When to Escalate

Escalate to higher tiers only when:
- The answer would be incorrect without more context
- User explicitly requests deep analysis
- Task requires cross-referencing multiple documents

## Agent-Specific Tips

- **Exel**: Focus on routing, oversight, QC. Delegate execution to specialists.
- **Axis**: Research briefs should be concise; cite sources efficiently.
- **Doni**: Write platform-native copy; avoid rigid templates.
- **Relay**: Schedule in batches; validate media links before scheduling.
- **Pulse**: Review performance with clear metrics; highlight actionable insights.
- **Quanxi**: Automate routine checks; use cron for reminders.

## Memory Hygiene

- Keep MEMORY.md entries brief: [timestamp] task_type | brief summary | result | agent_used
- Avoid duplicating information already in files.
- Use memory_search before adding new entries to prevent redundancy.

## Tool Usage

- Prefer read over exec for file content.
- Use web_search/scrape for current information instead of maintaining local copies.
- Combine multiple tool calls in single exec when safe.

## Validation

Before responding, ask: "Could I have answered this with less context?" If yes, restart at lighter tier.