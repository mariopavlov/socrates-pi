---
title: Implement coach slash commands
depends_on:
  - .specs/tasks/draft/implement-pi-extension-factory.feature.md
  - .specs/tasks/draft/implement-session-lifecycle-tools.feature.md
  - .specs/tasks/draft/implement-skill-decay-calculator.feature.md
---

## Initial User Prompt

Implement packages/mastery-coach/src/commands/ with slash command handlers registered via registerCommand: /practice-today (triggers decay selector, proposes one Task/Skill), /review-goals (lists active Goals with orphan count in header), /exit-mastery-mode (sets session-scoped flag so before_agent_start passes through and hides coach tools from LLM), /coach-mode-on (re-enters coach mode), /new (abandons current session if any, starts fresh). Each command must have a brief description string for autocomplete.

## Description

// Will be filled in future stages by business analyst
