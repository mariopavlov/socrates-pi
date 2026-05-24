---
title: Codebase Impact Analysis - MVP mastery-coach package scaffold with stub menu
task_file: .specs/tasks/draft/mvp-scaffold-and-stub-menu.feature.md
scratchpad: .specs/scratchpad/78e11fd1.md
created: 2026-05-23
status: complete
---

# Codebase Impact Analysis: MVP mastery-coach scaffold with stub menu

## Summary

- **Files to Modify**: 0 files (purely additive change)
- **Files to Create**: 14 files
- **Files to Delete**: 0 files
- **Test Files Affected**: 0 existing; 1 new test file needed
- **Risk Level**: Low

---

## Files to be Modified/Created

### Primary Changes

```
packages/mastery-coach/
├── package.json                       # NEW: "type":"module", "private":true, "pi":{"extensions":["./src/index.ts"]}
├── tsconfig.json                      # NEW: extends ../../tsconfig.base.json, noEmit: true, include: ["src"]
├── README.md                          # NEW: how to run link script, start pi, downstream layout
├── scripts/
│   └── link-extension.sh             # NEW: bash, idempotent symlink into ~/.pi/agent/extensions/mastery-coach
└── src/
    ├── index.ts                       # NEW: ExtensionFactory — session_start + 3 registerCommand calls
    ├── prompts/
    │   └── main-menu.ts              # NEW: MAIN_MENU_TEXT constant with 3-option menu
    ├── commands/
    │   ├── goal-oriented.ts          # NEW: handler stub — ctx.ui.notify("Not implemented yet", "info")
    │   ├── practice-today.ts         # NEW: handler stub
    │   └── open-practice.ts          # NEW: handler stub
    ├── tools/
    │   └── .gitkeep                  # NEW: placeholder for downstream sparql_*, mochi_*, session_* tools
    ├── domain/
    │   └── .gitkeep                  # NEW: placeholder for TS shapes mirroring ontology
    ├── decay/
    │   └── .gitkeep                  # NEW: placeholder for skill-decay calculator
    └── ontology/
        └── .gitkeep                  # NEW: placeholder for mc-ontology.ttl + shapes.ttl

packages/mastery-coach/
└── infra/
    └── .gitkeep                      # NEW: placeholder for docker-compose.yml + bootstrap/
```

---

## Useful Resources for Implementation

### Pattern References

```
packages/coding-agent/examples/extensions/
├── with-deps/
│   ├── package.json                  # "pi" manifest shape to copy exactly
│   └── index.ts                      # type-only import + default export factory pattern
├── commands.ts                        # registerCommand + ctx.ui.notify("...", "info") pattern
├── send-user-message.ts              # pi.sendUserMessage(string) pattern
└── plan-mode/
    └── index.ts                      # session_start handler structure (line 291-338)
```

### Authoritative Type Sources

```
packages/coding-agent/src/core/extensions/
├── types.ts                           # ExtensionAPI:L1084, SessionStartEvent:L513,
│                                      # ExtensionUIContext.notify:L135, sendUserMessage:L1187,
│                                      # ExtensionFactory:L1379, ExtensionCommandContext:L333
└── loader.ts                          # manifest discovery:L473-490, symlink handling:L535,
                                       # global ext dir:L578-579, virtualModules:L44-61
```

---

## Key Interfaces and Contracts

### Functions/Methods to Implement

| File | Name | Signature | Notes |
|------|------|-----------|-------|
| `src/index.ts` | `masteryCoachExtension` | `(pi: ExtensionAPI): void` | Default export |
| `src/index.ts` | session_start handler | `async (event: SessionStartEvent, _ctx: ExtensionContext): Promise<void>` | Filter `event.reason === "startup" \| "new"` |
| `src/commands/goal-oriented.ts` | handler | `async (_args: string, ctx: ExtensionCommandContext): Promise<void>` | `ctx.ui.notify("Not implemented yet", "info")` |
| `src/commands/practice-today.ts` | handler | same shape | same |
| `src/commands/open-practice.ts` | handler | same shape | same |

### Types/Interfaces Used (all from @earendil-works/pi-coding-agent)

| Type | Source Location | Relevant Fields |
|------|-----------------|-----------------|
| `ExtensionAPI` | `types.ts:L1084` | `on()`, `registerCommand()`, `sendUserMessage()` |
| `SessionStartEvent` | `types.ts:L513` | `reason: "startup" \| "reload" \| "new" \| "resume" \| "fork"` |
| `ExtensionContext` | `types.ts:L298` | `ui: ExtensionUIContext` |
| `ExtensionCommandContext` | `types.ts:L333` | extends ExtensionContext |
| `ExtensionUIContext` | `types.ts:L124` | `notify(message: string, type?: "info" \| "warning" \| "error"): void` |
| `ExtensionFactory` | `types.ts:L1379` | `(pi: ExtensionAPI) => void \| Promise<void>` |

---

## Integration Points

### Files That Interact with the New Package (No Change Needed)

| File | Relationship | Impact | Action |
|------|--------------|--------|--------|
| `package.json` | `"workspaces": ["packages/*"]` glob already covers mastery-coach | None | No change |
| `tsconfig.json` | `"include": ["packages/*/src/**/*"]` covers mastery-coach/src automatically | None | No change |
| `biome.json` | `"includes": ["packages/*/src/**/*.ts"]` covers mastery-coach/src automatically | None | No change |
| `packages/coding-agent/src/core/extensions/loader.ts` | Runtime discovery via symlink; `isSymbolicLink()` check at L535 passes | Runtime only | No change |

### Critical Loader Invariants to Satisfy

| Invariant | Source | Constraint |
|-----------|--------|------------|
| Manifest-first discovery | `loader.ts:L473-490` | `package.json` must have `"pi": { "extensions": ["./src/index.ts"] }` |
| Declared paths must exist | `loader.ts:L484` | `src/index.ts` must physically exist when Pi discovers extension |
| Symlinks are followed | `loader.ts:L535` | `entry.isSymbolicLink()` — symlink from extensions dir is supported |
| Type-only imports | `loader.ts:L44-61` | `@earendil-works/*` are virtual modules; must use `import type` |

### Import Convention Enforced by CI

| Check | Script | Rule |
|-------|--------|------|
| No relative `.js` imports | `scripts/check-ts-relative-imports.mjs` | All relative imports in `.ts` files must use `.ts` extension |

---

## Similar Implementations

### Pattern 1: Package Extension with pi Manifest

- **Location**: `packages/coding-agent/examples/extensions/with-deps/`
- **Why relevant**: Only package-style extension in codebase with `"pi": { "extensions": [...] }` manifest
- **Key files**:
  - `with-deps/package.json` — exact `"pi"` manifest shape; includes `"type": "module"`, `"private": true`
  - `with-deps/index.ts` — type-only import pattern, default export

### Pattern 2: Command Registration with notify

- **Location**: `packages/coding-agent/examples/extensions/commands.ts`
- **Why relevant**: Shows `registerCommand` + `ctx.ui.notify` in a production-quality extension
- **Key files**:
  - `commands.ts` — `pi.registerCommand(name, { description, handler })` shape and import pattern

### Pattern 3: session_start Handler

- **Location**: `packages/coding-agent/examples/extensions/plan-mode/index.ts:L291`
- **Why relevant**: Only real example of session_start usage; mastery-coach must add `event.reason` filter
- **Key files**:
  - `plan-mode/index.ts:L291-338` — session_start handler structure

---

## Test Coverage

### Existing Tests to Update

None.

### New Tests Needed

| Test Type | Location | Coverage Target |
|-----------|----------|-----------------|
| Unit/smoke | `packages/mastery-coach/src/index.test.ts` | MAIN_MENU_TEXT contains exact labels: "1. Goal-oriented", "2. Practice Today", "3. Open Practice" in order |
| Unit/smoke | `packages/mastery-coach/src/index.test.ts` | Each command handler surfaces exactly `"Not implemented yet"` via `ctx.ui.notify` |
| Unit | `packages/mastery-coach/src/index.test.ts` | session_start does NOT send menu when `reason` is `"reload"`, `"resume"`, or `"fork"` |

---

## Risk Assessment

### High Risk Areas

| Area | Risk | Mitigation |
|------|------|------------|
| Value import from @earendil-works/* | jiti virtualModules work for type-only; value import would attempt filesystem resolution and fail at runtime | Use `import type { ... }` exclusively; CI `tsgo --noEmit` will catch misuse |
| Action call at factory top level | `pi.sendUserMessage()` called outside a handler throws "Extension runtime not initialized" | Only call inside session_start handler callback, never at factory top level |
| Missing extensions dir before symlink | `ln` fails if parent `~/.pi/agent/extensions/` does not exist | Link script must `mkdir -p "$EXTENSIONS_DIR"` before `ln -sfn` |
| biome formatting | New .ts files with spaces instead of tabs fail `biome check --write --error-on-warnings` | Use tab indentation, lineWidth 120 in all source files |

### Low Risk Areas

| Area | Notes |
|------|-------|
| Workspace registration | `packages/*` glob covers mastery-coach — no root package.json edit needed |
| TypeScript coverage | Root tsconfig.json `packages/*/src/**/*` include covers mastery-coach/src |
| Upstream invariant | Zero files under packages/agent, packages/ai, packages/coding-agent, packages/tui need modification |

---

## Recommended Exploration Before Implementation

1. `packages/coding-agent/src/core/extensions/types.ts:L1084-L1190` — Full `ExtensionAPI` interface; verify `on()` overloads and `registerCommand()` exact signature before writing.

2. `packages/coding-agent/examples/extensions/with-deps/package.json` — Use as the starting template for `packages/mastery-coach/package.json`.

3. `packages/coding-agent/src/core/extensions/loader.ts:L440-L503` — Understand manifest parsing and `fs.existsSync` guard so declared path must exist when Pi loads.

4. `.claude/skills/pi-extension-development/SKILL.md` — Complete reference with pitfalls table and the minimal working extension code example; implementation must match this skill's patterns.

5. `packages/coding-agent/examples/extensions/plan-mode/index.ts:L291-338` — session_start handler structure; adapt by adding `event.reason` filter and simplifying to a single `pi.sendUserMessage()` call.

---

## Verification Summary

| Check | Status | Notes |
|-------|--------|-------|
| All affected files identified | OK | 14 new files, 0 modified files |
| Integration points mapped | OK | Loader discovery, workspace glob, tsconfig include, biome include all verified against source files |
| Similar patterns found | OK | 3 patterns documented with exact file paths |
| Test coverage analyzed | OK | 0 existing tests affected; 3 new unit/smoke tests required |
| Risks assessed | OK | 4 risk areas with concrete mitigations |
| Import convention verified | OK | `.ts` extension required for relative imports; enforced by check-ts-relative-imports.mjs |
| Upstream invariant verified | OK | Zero modifications to packages/agent, packages/ai, packages/coding-agent, packages/tui |

Limitations/Caveats: The env var `PI_AGENT_DIR` referenced in the task spec for the link script differs from `PI_CODING_AGENT_DIR` used internally by Pi's `getAgentDir()`. Both default to `~/.pi/agent/`, so the default flow is unaffected. Users who set `PI_CODING_AGENT_DIR` would need to also set `PI_AGENT_DIR` for the link script to target the same location.
