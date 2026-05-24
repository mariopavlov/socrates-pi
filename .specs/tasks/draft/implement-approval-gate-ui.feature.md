---
title: Implement mc.gate approval gate custom message renderer
depends_on:
  - .specs/tasks/draft/implement-pi-extension-factory.feature.md
---

## Initial User Prompt

Implement the registerMessageRenderer hook for mc.gate messages so that any sparql_update or write-path tool surfaces a structured TUI approval prompt to the apprentice before firing. The renderer must show the SPARQL update statement, a plain-language reason string, and three actions: approve / approve-edit / reject. Batch approval for related writes from a single session is a stretch goal. The renderer lives in packages/mastery-coach/src/commands/.

## Description

// Will be filled in future stages by business analyst
