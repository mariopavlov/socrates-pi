---
title: Implement Mochi SRS integration tools
depends_on:
  - .specs/tasks/draft/implement-sparql-tools.feature.md
  - .specs/tasks/draft/implement-pi-extension-factory.feature.md
---

## Initial User Prompt

Implement packages/mastery-coach/src/tools/mochi.ts with four LLM tools: mochi_propose_card (stages card candidates from session insights for review), mochi_commit_card (gated via mc.gate; calls POST /cards on app.mochi.cards and writes the mc:Card RDF node to GraphDB), mochi_list_decks (admin/browse), mochi_find_cards (dedup check). Auth via HTTP Basic with API key from ~/.config/mastery-coach/secrets.json. Deck paths mirror skos:broader chain (e.g. Mastery::Semantic Web::SPARQL::SELECT). Cache mc:mochiDeckId on the Skill node after first deck creation.

## Description

// Will be filled in future stages by business analyst
