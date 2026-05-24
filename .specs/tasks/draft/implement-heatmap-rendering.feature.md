---
title: Implement ASCII heatmap with career-alignment narrative overlay
depends_on:
  - .specs/tasks/draft/implement-session-lifecycle-tools.feature.md
  - .specs/tasks/draft/implement-coach-system-prompt.feature.md
---

## Initial User Prompt

Implement packages/mastery-coach/src/tools/heatmap.ts that generates an ASCII calendar heatmap of coach-interactive minutes per day (target = 45 min/day) sourced from a SPARQL query over mc:Session durationMinutes. Overlay a one-line career-alignment narrative (e.g. "3 of 7 active Goals align with Solutions Architect role"). Output is rendered in the TUI as part of the main menu or on demand via a /heatmap slash command.

## Description

// Will be filled in future stages by business analyst
