---
title: Implement session lifecycle tools (open, plan, close)
depends_on:
  - .specs/tasks/draft/implement-sparql-tools.feature.md
  - .specs/tasks/draft/implement-pi-extension-factory.feature.md
---

## Initial User Prompt

Implement packages/mastery-coach/src/tools/session.ts with session management tools: session_open (creates mc:Session with prov:startedAtTime, origin, apprentice link; enforces at-most-one in-progress via SHACL before insert), session_set_plan (attaches the agreed arc to the open session), and session_close (sets mc:status "completed", records durationMinutes, writes reflection summary). Also wire the turn_end and tool_result hooks to auto-log events into the active session, and session_shutdown to flush pending writes.

## Description

// Will be filled in future stages by business analyst
