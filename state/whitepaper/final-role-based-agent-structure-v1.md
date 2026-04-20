# Final Role-Based Agent Structure v1

Date: 2026-04-20
Owner decision: Reandy chose the strict role-based structure.

## Official structure
- Exel = Master Orchestrator
- Research Agent = industry research, audience insight, angle finding
- DONI = Content Agent
- Publishing Agent = scheduling and distribution
- Analytics Agent = performance reading and insight
- Quanxi = Operations Agent

## Core rule
1 agent = 1 role/jobdesk.

## Front-facing rule
Reandy talks only to Exel.
All backstage routing happens internally.

## Whitepaper operating flow
1. Exel receives brief
2. Research Agent prepares angle and message direction
3. DONI turns research into platform-specific content
4. Publishing Agent schedules/distributes
5. Analytics Agent reads performance
6. Quanxi keeps workflow, files, reminders, automation, and debugging clean
7. Exel reviews and gives the final decision/update to Reandy

## Intent behind this structure
- keep each lane sharp
- avoid overlap between research, writing, publishing, analytics, and operations
- make each agent easier to improve independently
- keep the user experience simple with one front door

## Transition note
If the runtime is not yet fully split into dedicated agents, Exel may temporarily bridge missing lanes.
But the target model stays fixed: 1 agent = 1 role/jobdesk.
