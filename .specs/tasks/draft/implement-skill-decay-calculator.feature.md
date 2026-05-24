---
title: Implement skill decay calculator and Practice Today selector
depends_on:
  - .specs/tasks/draft/implement-sparql-tools.feature.md
  - .specs/tasks/draft/implement-session-lifecycle-tools.feature.md
---

## Initial User Prompt

Implement packages/mastery-coach/src/decay/ with: (1) a decay function that computes a staleness score per skill from mc:Mastery (last level + assessedAt), mc:DecayState (half-life per skill), time elapsed, cumulative practice minutes from sessions, and SKOS taxonomy proximity via skos:broader chain; (2) a Practice Today selector that ranks skills by staleness and career/goal alignment and returns the top candidate. Expose results as a skill_decay_check() tool callable by the LLM during Phase A recall check.

## Description

// Will be filled in future stages by business analyst
