---
title: Implement Pi extension factory and extension link script
depends_on:
  - .specs/tasks/draft/scaffold-mastery-coach-package.chore.md
---

## Initial User Prompt

Create packages/mastery-coach/src/index.ts as the Pi extension factory that registers all hooks (session_start, before_agent_start, registerTool, registerCommand, registerMessageRenderer, turn_end, tool_result, session_shutdown, message_end) with stub implementations. Also write packages/mastery-coach/scripts/link-extension.sh that symlinks the package into ~/.pi/agent/extensions/mastery-coach/. The extension must load without errors even with no tools registered yet.

## Description

// Will be filled in future stages by business analyst
