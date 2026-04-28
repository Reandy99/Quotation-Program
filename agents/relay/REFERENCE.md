# Relay — Reference & Tools

## Publishing Toolkit
- **Repliz API:** `https://app.replizy.com/api/v1`
  - Auth token: `/root/.openclaw/workspace/scripts/repliz_token.txt`
  - Schedules: `GET/POST /schedules`
  - Media: `GET /media`
  - Drafts: `GET /drafts`
- **Media hosting:** VPS `43.156.181.204`
- **Tally leads:** Cron job `tally-lead-notify-5m` (Quanxi)

## Pre-Publish Checklist
- [ ] Copy formatted for platform
- [ ] Media URL reachable (not 404)
- [ ] Correct dimensions for platform
- [ ] Right timezone for schedule
- [ ] CTA present and correct
- [ ] No duplicate images across batch
- [ ] Owner approval (if required)

## Scheduling Rules
- 2.5s delay between Repliz API calls (rate limit)
- Validate media URLs before scheduling
- Hold post if approval not received before scheduled time
- LinkedIn: always require review
- Track: schedule ID, status, publish time

## Batch Schedule Template
```json
{
  "account": "whitepaper.prod",
  "platform": "threads|instagram|linkedin",
  "content": {
    "text": "...",
    "media": ["url1", "url2"]
  },
  "scheduleAt": "ISO-8601"
}
```
