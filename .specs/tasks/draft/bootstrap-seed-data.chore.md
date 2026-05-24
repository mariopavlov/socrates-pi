---
title: Bootstrap seed data for Mario's person, career and current role
depends_on:
  - .specs/tasks/draft/setup-graphdb-infrastructure.chore.md
  - .specs/tasks/draft/define-mastery-coach-ontology.feature.md
---

## Initial User Prompt

Extend the bootstrap script to seed the initial graph data: mcd:mario (foaf:Person with email marioppavlov@gmail.com), mcd:career/mario (mc:Career aligned to mcd:mario), and mcd:role/sa-limechain (mc:Role, Solutions Architect at LimeChain, marked as currentRole). The seed step must be idempotent — running bootstrap twice must not create duplicate triples.

## Description

// Will be filled in future stages by business analyst
