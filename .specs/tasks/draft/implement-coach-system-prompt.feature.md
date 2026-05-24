---
title: Implement coach system prompt with live graph state injection
depends_on:
  - .specs/tasks/draft/implement-pi-extension-factory.feature.md
  - .specs/tasks/draft/implement-session-lifecycle-tools.feature.md
---

## Initial User Prompt

Author packages/mastery-coach/src/prompts/coach-system.ts that: (1) defines the Robert-Greene-style mastery coach persona text (one question at a time, no rubber-stamps, skill-struggle preservation, mode awareness); (2) fetches live graph state via SPARQL at each before_agent_start invocation (active goals, current session plan, recent mastery snapshots, orphan count); (3) composes final system prompt string injecting the live state. Handle mode flags (Pure Learning / Delivery / Architect Pseudocode) to restrict when the coach can produce code. The rubber-stamp check on message_end must detect shallow user replies ("ok", "looks good") and flag them to the coach.

## Description

// Will be filled in future stages by business analyst
