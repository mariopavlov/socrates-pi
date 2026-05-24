---
title: Implement LLM-rendered main menu at session start
depends_on:
  - .specs/tasks/draft/implement-pi-extension-factory.feature.md
---

## Initial User Prompt

Implement the session_start hook in the Pi extension so that when pi starts it renders the Mastery Coach main menu as a custom LLM-rendered message. The menu must present three origin choices (1. Goal-oriented, 2. Practice Today, 3. Open Practice) plus any resume prompt if an in-progress mc:Session exists (from a SPARQL ASK query). Menu text lives in packages/mastery-coach/src/prompts/.

## Description

// Will be filled in future stages by business analyst
