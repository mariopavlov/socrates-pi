---
title: Implement SPARQL LLM tools for GraphDB communication
depends_on:
  - .specs/tasks/draft/setup-graphdb-infrastructure.chore.md
  - .specs/tasks/draft/define-mastery-coach-ontology.feature.md
  - .specs/tasks/draft/implement-domain-types.feature.md
---

## Initial User Prompt

Implement packages/mastery-coach/src/tools/sparql.ts with six tools exposed to the LLM: sparql_select (returns JSON bindings), sparql_ask (returns boolean), sparql_construct (returns Turtle), sparql_update (gated via mc.gate approval before executing), describe_ontology (returns class+property summary), and list_repositories (admin/health). Use sparql-http-client (Zazuko) for transport. All tools must include TypeBox parameter schemas.

## Description

// Will be filled in future stages by business analyst
