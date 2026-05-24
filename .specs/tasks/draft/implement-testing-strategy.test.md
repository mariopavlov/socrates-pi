---
title: Implement test suite (unit, integration, end-to-end)
depends_on:
  - .specs/tasks/draft/implement-sparql-tools.feature.md
  - .specs/tasks/draft/implement-session-lifecycle-tools.feature.md
  - .specs/tasks/draft/implement-skill-decay-calculator.feature.md
  - .specs/tasks/draft/implement-slash-commands.feature.md
  - .specs/tasks/draft/implement-mochi-tools.feature.md
---

## Initial User Prompt

Implement the three-tier test strategy: (1) Vitest unit tests for all tools with a faux SPARQL endpoint (nock/msw) and faux Mochi client — cover sparql_update gating, mochi_commit_card gate flow, skill_decay_check ranking; (2) Integration tests that spin up a real GraphDB container (Testcontainers or docker-compose in CI) and run the bootstrap + seed + full SPARQL tool round-trip; (3) End-to-end test of one complete Phase A → Phase B session via pi's RPC/headless mode. Add a GitHub Actions CI workflow that runs unit + integration tests on every PR.

## Description

// Will be filled in future stages by business analyst
