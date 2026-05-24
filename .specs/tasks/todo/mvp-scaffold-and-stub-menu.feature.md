---
title: Implement MVP mastery-coach package scaffold with stub menu and Not-Implemented responses
---

## Initial User Prompt

I want to see the agent running with my menu. When I pick a menu option I should receive "Not implemented yet". This covers: (1) creating the packages/mastery-coach/ directory structure with package.json and tsconfig; (2) a minimal Pi extension factory (src/index.ts) that registers hooks and symlinks into ~/.pi/agent/extensions/mastery-coach/; (3) a session_start hook that renders the three-option Mastery Coach main menu (1. Goal-oriented, 2. Practice Today, 3. Open Practice); (4) stub slash-command handlers for each menu option that reply "Not implemented yet" when invoked. No GraphDB, no Mochi, no real tools — just the running skeleton so progress is visible.

## Description

> **Required Skill**: You MUST use and analyse `pi-extension-development` skill before doing any modification to task file or starting implementation of it!
>
> Skill location: `.claude/skills/pi-extension-development/SKILL.md`

The Mastery Coach is being built as a substantial Pi extension (see `.specs/plans/mastery-coach.design.md`), with many downstream feature tasks already drafted in `.specs/tasks/draft/` (SPARQL tools, Mochi integration, ontology, decay calculator, session lifecycle tools, approval gates, heatmap, etc.). Before committing to that volume of code, Mario needs a **walking skeleton** that proves the integration assumptions in the design doc and the `pi-extension-development` skill are real: that the new `packages/mastery-coach/` package is picked up via the `pi.extensions` manifest, that the symlink convention into `~/.pi/agent/extensions/mastery-coach/` actually causes Pi to discover the extension via jiti, that Pi's `session_start` hook fires as expected, and that slash commands registered via `pi.registerCommand` route back to the extension. Without this skeleton, every downstream coach task carries the same hidden integration risk.

This task delivers exactly that skeleton — and nothing more. The four deliverables are:

1. The `packages/mastery-coach/` scaffold with `package.json` (declaring `"type": "module"`, `"private": true`, and the Pi entry-point manifest `"pi": { "extensions": ["./src/index.ts"] }`), a `tsconfig.json` extending `tsconfig.base.json` with `"noEmit": true` (no build step — jiti transpiles at runtime), and the directory layout from design § 1 (subdirectories pre-created with `.gitkeep` where empty, so each downstream task has a home).
2. A minimal Pi extension factory at `src/index.ts` (default-exported `(pi: ExtensionAPI) => void`) that uses only type-only imports from `@earendil-works/pi-coding-agent` and registers only what the MVP actually exercises: a `session_start` listener and three slash commands. No other hooks are wired in this MVP; they are added by their owning downstream tasks.
3. A `session_start` hook that, when the event's `reason` is `"startup"` or `"new"` (not reload, resume, or fork), renders a static three-option main menu via `pi.sendUserMessage` containing the header and the exact labels `1. Goal-oriented`, `2. Practice Today`, `3. Open Practice` in that order, plus a one-line instruction telling the apprentice how to pick an option.
4. Three slash-command handlers — `/goal-oriented`, `/practice-today`, `/open-practice`, each with a one-line `description` — that surface the literal string `Not implemented yet` to the apprentice (e.g. via `ctx.ui.notify`), plus `scripts/link-extension.sh` that creates the symlink at `${PI_AGENT_DIR:-$HOME/.pi/agent}/extensions/mastery-coach` idempotently (re-runs are safe via `ln -sfn`; missing parent directories are created via `mkdir -p`).

The benefit is a visible, runnable Mastery Coach that Mario can start with `pi` and click through end-to-end today. The apprentice (Mario) benefits by getting concrete validation of the extension wiring before sinking effort into SPARQL, Mochi, decay, and gates; every subsequent draft task benefits by inheriting a known-good package shell. The upstream-untouched invariant from design § 1 is preserved by keeping every file under `packages/mastery-coach/`.

**Scope**:

- **Included**: New `packages/mastery-coach/` package registered in the npm workspace; `package.json` declaring `"type": "module"` and the `pi.extensions` entry manifest; `tsconfig.json` extending `tsconfig.base.json` with `noEmit`; the directory layout from design § 1 (`src/prompts/`, `src/commands/`, `src/tools/`, `src/domain/`, `src/decay/`, `src/ontology/`, `infra/`, `scripts/`), with empty directories marked by `.gitkeep`; Pi extension factory at `src/index.ts` registering `session_start` and three commands; static main-menu text in `src/prompts/`; three slash-command stub handlers in `src/commands/` that surface exactly `Not implemented yet`; `scripts/link-extension.sh` (bash, idempotent, honours `$PI_AGENT_DIR`, creates missing parent directories).
- **Excluded**: GraphDB infrastructure and any SPARQL tools or queries (including the resume-detection SPARQL ASK that the full `implement-main-menu-rendering.feature.md` will add); Mochi integration and card creation; the real coach system prompt and the `before_agent_start` rewrite; session lifecycle tools (`session_open`, `session_set_plan`, etc.); skill decay calculator and Practice Today selector logic; approval gates and the `mc.gate` custom message renderer; heatmap rendering; ontology files (`mc-ontology.ttl`, `shapes.ttl`) and SHACL shapes; secrets handling (`~/.config/mastery-coach/secrets.json`); the full slash-command surface (`/review-goals`, `/exit-mastery-mode`, `/coach-mode-on`, `/new`) in any form beyond the three origin stubs; LLM-parsed numeric input handling (the menu instructs the apprentice to invoke a slash command, since `1`/`2`/`3` parsing requires the real coach system prompt which is a separate task); registration of any other lifecycle hook (`before_agent_start`, `session_shutdown`, `message_end`, `tool_result`, `context`, `input`, `agent_start`, `agent_end`); any LLM tool (`pi.registerTool`); any custom message renderer; cross-platform (Windows/PowerShell) link script; modification of any file under `packages/agent`, `packages/ai`, `packages/coding-agent`, or `packages/tui`.

**User Scenarios**:

1. **Primary Flow**: Mario clones/updates the fork and runs `npm install`. He runs `bash packages/mastery-coach/scripts/link-extension.sh` once. He starts `pi` from any directory. The TUI shows the Mastery Coach main menu with the three numbered origins and a one-line instruction to invoke a slash command. He invokes one of the three origin slash commands. The corresponding handler surfaces `Not implemented yet`. He can invoke any of the other two origins and observes the same response.
2. **Alternative Flow A — link script re-run**: Mario re-runs `link-extension.sh`. The script (using `ln -sfn`) refreshes the symlink in place pointing at the package directory and exits 0 without error or duplication.
3. **Alternative Flow B — pi reload mid-session**: Mario uses `/reload` inside an active pi session. Because the `session_start` handler filters on `event.reason`, the menu does not re-render on reload (only on initial `"startup"` and on `"new"` sessions). The extension still loads and the three commands remain available.
4. **Error Handling**: If `${PI_AGENT_DIR:-$HOME/.pi/agent}/extensions/` does not yet exist, the link script creates it and any missing parent directories before symlinking, then exits 0. The extension factory itself performs no I/O at load time and therefore has no runtime failure modes during pi startup.

---

## Acceptance Criteria

### Functional Requirements

- [ ] **Package scaffold exists and passes static checks**: A new `packages/mastery-coach/` package is part of the monorepo workspace and passes the repo's type and lint checks. No build step is required — Pi loads the extension via jiti at runtime.
  - Given: A fresh clone of the fork.
  - When: The apprentice runs `npm install` from the repo root and then runs the repo's standard typecheck and biome lint commands.
  - Then: `packages/mastery-coach/` is part of the npm workspace; the typecheck exits 0 with no TypeScript errors in the new package; biome lint exits 0 with no new errors in any package; no previously-passing package now fails as a result of the addition.

- [ ] **Pi extension manifest is declared in package.json**: The package advertises its Pi entry point so Pi's loader discovers it in a symlinked subdirectory of the extensions directory.
  - Given: The package has been created.
  - When: Pi's loader processes the symlinked directory `~/.pi/agent/extensions/mastery-coach/`.
  - Then: The package's `package.json` contains `"type": "module"`, `"private": true`, and a `"pi"` field whose `"extensions"` array includes the entry path `"./src/index.ts"`; Pi reads this manifest and selects the declared entry without falling back to an `index.ts` heuristic at the package root.

- [ ] **Link script is idempotent, honours `PI_AGENT_DIR`, and creates missing parents**: A bash script creates and maintains the symlink that makes Pi pick up the extension.
  - Given: The link script has not yet been run on this machine and `${PI_AGENT_DIR:-$HOME/.pi/agent}/extensions/` may or may not exist.
  - When: The operator runs `bash packages/mastery-coach/scripts/link-extension.sh` once, then runs the same script a second time.
  - Then: After both runs, `${PI_AGENT_DIR:-$HOME/.pi/agent}/extensions/mastery-coach` exists as a symlink resolving to the `packages/mastery-coach/` directory in the fork; the script exits 0 on both invocations; if any parent directory was missing, the script created it; re-running the script produces no duplicate entries and no errors.

- [ ] **Extension loads cleanly into pi at startup**: Pi discovers and loads the Mastery Coach extension via jiti without error.
  - Given: The link script has been run and `npm install` is complete.
  - When: The apprentice starts `pi`.
  - Then: Pi starts successfully; no extension-loading error from `mastery-coach` is logged or shown in the TUI; the three slash commands (`/goal-oriented`, `/practice-today`, `/open-practice`) are discoverable in the command list/autocomplete.

- [ ] **Main menu renders at startup and on new sessions only**: The `session_start` hook produces a deterministic, statically-rendered menu, and only at appropriate session events.
  - Given: Pi is starting (or the apprentice is creating a new session).
  - When: The `session_start` event fires with `reason === "startup"` or `reason === "new"`.
  - Then: A user-side message is sent (via `pi.sendUserMessage`) containing a Mastery Coach header, the three options exactly as `1. Goal-oriented`, `2. Practice Today`, `3. Open Practice` in this order, and a one-line instruction directing the apprentice to invoke the corresponding slash command for the chosen option; conversely, when `session_start` fires with a different `reason` (e.g. `reload`, `resume`, `fork`), the menu message is NOT re-sent.

- [ ] **Each origin selection surfaces the exact stub reply**: Each of the three slash commands is wired to a handler that surfaces the agreed stub string to the apprentice and performs no other action.
  - Given: Pi is running with the extension loaded.
  - When: The apprentice invokes any one of the three origin slash commands (`/goal-oriented`, `/practice-today`, or `/open-practice`).
  - Then: The apprentice observes the literal string `Not implemented yet` in the TUI (via a `ctx.ui.notify` call or equivalent UI surface); no graph write, file write, or network call occurs; no session state is persisted; the handler returns normally so the apprentice can immediately invoke any of the other two commands and observe the same response.

- [ ] **No other hooks or tools are registered in the MVP**: The extension factory's surface is limited to the MVP scope.
  - Given: The extension has been implemented.
  - When: The extension factory is loaded.
  - Then: The factory calls `pi.on` only for `"session_start"` (no `before_agent_start`, `session_shutdown`, `message_end`, `tool_result`, `context`, `input`, `agent_start`, `agent_end`); the factory calls `pi.registerCommand` exactly three times (for the three origins); the factory does NOT call `pi.registerTool`, does NOT register any custom message renderer, and does NOT perform any I/O at factory top-level.

- [ ] **Upstream Pi packages remain untouched**: The change preserves the upstream-merge invariant from design § 1.
  - Given: The implementation has been committed on a branch.
  - When: `git diff main -- packages/agent packages/ai packages/coding-agent packages/tui` is executed.
  - Then: The diff output is empty (zero lines).

- [ ] **No external services or secrets are required to run the MVP**: The skeleton runs with no GraphDB, no Mochi, no secrets file.
  - Given: The apprentice has not started any GraphDB container and has no Mochi API key or `~/.config/mastery-coach/secrets.json` configured.
  - When: The apprentice runs the link script and starts `pi`.
  - Then: The menu renders, the three stub responses fire on invocation, no network call is attempted by the extension, and no read of `~/.config/mastery-coach/secrets.json` (or any other secret) is attempted.

### Non-Functional Requirements

- [ ] **Maintainability — directory layout matches design**: The package contains the subdirectories listed in design § 1 (`src/prompts/`, `src/commands/`, `src/tools/`, `src/domain/`, `src/decay/`, `src/ontology/`, `infra/`, `scripts/`), with `.gitkeep` files in any that are empty in this MVP, so downstream draft tasks land in their intended home without restructuring.
- [ ] **Build hygiene**: `tsconfig.json` extends `tsconfig.base.json` and sets `"noEmit": true`; the MVP source uses type-only imports from `@earendil-works/pi-coding-agent`; the MVP source contains no `any` types; no new biome warnings are introduced anywhere in the monorepo as a result of this change.
- [ ] **Reversibility**: Deleting the symlink (`rm ~/.pi/agent/extensions/mastery-coach`) and removing the `packages/mastery-coach/` directory leaves Pi behaving exactly as upstream — no residual configuration or registration remains.
- [ ] **Startup performance**: The `session_start` handler performs no blocking I/O (no filesystem reads, no network calls); it issues a single `pi.sendUserMessage` and returns immediately, adding no perceptible delay versus baseline `pi` startup measured before this change.

### Definition of Done

- [ ] All acceptance criteria pass.
- [ ] Tests written and passing (at minimum: smoke coverage verifying the menu text content/ordering and that each of the three command handlers surfaces exactly `Not implemented yet`).
- [ ] Documentation updated (a short README in `packages/mastery-coach/` describing how to run the link script, how to start `pi`, and that downstream features land in the pre-created subdirectories).
- [ ] Code reviewed.

---

## Architecture

### References

- **Skill**: `.claude/skills/pi-extension-development/SKILL.md`
- **Codebase Analysis**: `.specs/analysis/analysis-mvp-scaffold-and-stub-menu.md`
- **Scratchpad**: `.specs/scratchpad/0d730eff.md`
- **Design doc**: `.specs/plans/mastery-coach.design.md` (§ 1 directory layout, § 2 hooks)
- **Authoritative loader**: `packages/coding-agent/src/core/extensions/loader.ts:L440-L600`
- **Authoritative API types**: `packages/coding-agent/src/core/extensions/types.ts:L124-L135, L298-L333, L513-L519, L1084-L1190`
- **Pattern: pi manifest package**: `packages/coding-agent/examples/extensions/with-deps/`
- **Pattern: registerCommand + notify**: `packages/coding-agent/examples/extensions/commands.ts`
- **Pattern: sendUserMessage**: `packages/coding-agent/examples/extensions/send-user-message.ts`
- **Pattern: session_start**: `packages/coding-agent/examples/extensions/plan-mode/index.ts:L291-L338`

### Solution Strategy

**Approach**: A purely-additive Pi extension package at `packages/mastery-coach/` with a modular structure (factory + per-command files + menu prompt + link script). The factory is the only adapter to Pi; commands and the menu are pure presentation. All downstream-coach subdirectories from the design doc are pre-created with `.gitkeep` placeholders so subsequent feature tasks have a home. No build step; jiti transpiles at runtime. Tests live in `packages/mastery-coach/test/` to match the root tsconfig and biome include patterns.

**Architecture Pattern**: **Hexagonal (Ports & Adapters) with pre-declared layered domain structure** — chosen because the Mastery Coach will eventually integrate with multiple external systems (GraphDB via SPARQL, Mochi via REST, Pi via `ExtensionAPI`). For this MVP only the Pi adapter is wired (`src/index.ts` + `src/commands/*`); other adapters (`src/tools/`, `infra/`) are scaffolded as `.gitkeep` placeholders so downstream tasks slot in without restructuring. Codebase precedent: `packages/coding-agent/examples/extensions/plan-mode/index.ts` separates Pi adapters, internal state, and UI rendering in one file; we generalise that into directories aligned with design § 1.

**Key Decisions**:
1. **Modular index.ts + per-command files** — chosen over a monolithic `index.ts` because it matches design § 1 layout, mirrors `examples/extensions/commands.ts`, and is the most testable.
2. **`src/index.ts` entry path in `"pi": { "extensions": [...] }` manifest** — `loader.ts:L478-485` accepts any resolvable path; nesting under `src/` keeps downstream code consistent.
3. **Symlink (`ln -sfn`), not copy** — edits to the package are picked up via `/reload` in pi.
4. **`PI_AGENT_DIR` env var honoured by link script** (per task spec); README documents the discrepancy with Pi's internal `PI_CODING_AGENT_DIR`.
5. **Tests in `packages/mastery-coach/test/`, not `src/`** — required by root `tsconfig.json` include pattern `packages/*/test/**/*` and root `biome.json` includes.

**Trade-offs Accepted**:
- Higher file count (three command files instead of inline handlers) for layout alignment with downstream tasks.
- Two env var names (`PI_AGENT_DIR` for link script, `PI_CODING_AGENT_DIR` for Pi's loader) — documented in README; both default to `~/.pi/agent`, so the default case is unaffected.
- `sendUserMessage` triggers a full LLM turn (menu appears as user input and the model may respond). Acceptable for MVP; downstream `before_agent_start` + real coach system prompt will shape responses.

---

### Architecture Decomposition

**Components**:

| Component                                | Layer       | Responsibility                                                | Dependencies |
|------------------------------------------|-------------|---------------------------------------------------------------|--------------|
| `src/index.ts` (factory)                 | Framework   | Wire Pi `ExtensionAPI` to commands + menu                     | type-only `ExtensionAPI`; `./prompts/main-menu.ts`; `./commands/*.ts` |
| `src/prompts/main-menu.ts`               | Adapter     | Static menu text constant                                     | None |
| `src/commands/goal-oriented.ts`          | Adapter     | Stub handler for `/goal-oriented`                             | type-only `ExtensionCommandContext` |
| `src/commands/practice-today.ts`         | Adapter     | Stub handler for `/practice-today`                            | type-only `ExtensionCommandContext` |
| `src/commands/open-practice.ts`          | Adapter     | Stub handler for `/open-practice`                             | type-only `ExtensionCommandContext` |
| `src/{tools,domain,decay,ontology}/`     | Reserved    | Empty placeholders for downstream tasks                       | None |
| `infra/`                                 | Reserved    | Empty placeholder for docker-compose + bootstrap              | None |
| `scripts/link-extension.sh`              | Framework   | Symlink package into `~/.pi/agent/extensions/`                | bash, ln, mkdir |
| `package.json`                           | Manifest    | Workspace registration + Pi entry-point declaration           | None |
| `tsconfig.json`                          | Build       | Extend base, noEmit                                           | `../../tsconfig.base.json` |
| `README.md`                              | Docs        | Setup instructions + env var caveat                           | None |
| `test/mastery-coach.test.ts`             | Test        | Verify menu + stub behaviour + reason filter                  | vitest, mocked Pi API |

**Interactions**:

```
                          ┌──────────────────────────┐
                          │  Pi runtime (loader.ts)  │
                          └────────────┬─────────────┘
                                       │ jiti import
                                       ▼
                          ┌──────────────────────────┐
                          │   src/index.ts (factory) │
                          └──┬──────────┬──────────┬─┘
                             │          │          │
                  registerCommand × 3   on(...)    sendUserMessage (in handler)
                             │          │          │
              ┌──────────────┴─┐    ┌───┴────────┐ │
              ▼                ▼    ▼            ▼ ▼
   src/commands/goal-       commands/  commands/  src/prompts/
   oriented.ts              practice-  open-      main-menu.ts
   (stub handler)           today.ts   practice.ts (MAIN_MENU_TEXT)
```

---

### Expected Changes

```
packages/mastery-coach/                     # NEW (entire tree)
├── package.json                            # NEW: ESM, private, pi manifest, test script
├── tsconfig.json                           # NEW: extends base, noEmit, include src+test
├── README.md                               # NEW: link script + pi startup + env var note
├── scripts/
│   └── link-extension.sh                   # NEW: bash, idempotent, honours PI_AGENT_DIR
├── src/
│   ├── index.ts                            # NEW: ExtensionFactory
│   ├── prompts/
│   │   └── main-menu.ts                    # NEW: MAIN_MENU_TEXT constant
│   ├── commands/
│   │   ├── goal-oriented.ts                # NEW: stub command definition
│   │   ├── practice-today.ts               # NEW: stub command definition
│   │   └── open-practice.ts                # NEW: stub command definition
│   ├── tools/.gitkeep                      # NEW: placeholder
│   ├── domain/.gitkeep                     # NEW: placeholder
│   ├── decay/.gitkeep                      # NEW: placeholder
│   └── ontology/.gitkeep                   # NEW: placeholder
├── infra/.gitkeep                          # NEW: placeholder
└── test/
    └── mastery-coach.test.ts               # NEW: unit/smoke coverage

Root files (UNCHANGED — already cover the new package):
- package.json                              # workspaces: ["packages/*"] glob
- tsconfig.json                             # include: ["packages/*/src/**/*", "packages/*/test/**/*"]
- biome.json                                # includes: ["packages/*/src/**/*.ts", "packages/*/test/**/*.ts"]

Upstream packages (UNCHANGED — invariant from design § 1):
- packages/agent, packages/ai, packages/coding-agent, packages/tui
```

---

### Building Block View

```
┌─────────────────────────────────────────────────────────────┐
│                 packages/mastery-coach (extension)          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                        │
│  │ scripts/        │  link-extension.sh ── (idempotent      │
│  │                 │   symlink to ~/.pi/agent/extensions/)  │
│  └─────────────────┘                                        │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │ src/index.ts    │───▶│ src/prompts/    │                 │
│  │ (ExtensionFact.)│    │ main-menu.ts    │                 │
│  └────┬────────────┘    └─────────────────┘                 │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │ src/commands/   │    │ src/commands/   │  ┌────────────┐ │
│  │ goal-oriented   │    │ practice-today  │  │ commands/  │ │
│  └─────────────────┘    └─────────────────┘  │ open-      │ │
│                                              │ practice   │ │
│                                              └────────────┘ │
│                                                             │
│  ┌───────── reserved subdirs (downstream homes) ─────────┐  │
│  │  src/tools/  src/domain/  src/decay/  src/ontology/   │  │
│  │  infra/                                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────────────┐
   │  Pi runtime (unmodified upstream)        │
   │  - loader.ts follows symlink             │
   │  - reads package.json `pi.extensions`    │
   │  - jiti transpiles & invokes factory     │
   └──────────────────────────────────────────┘
```

---

### Runtime Scenarios

**Scenario: Cold start with link in place**

```
[user runs `pi`]
   ──► Pi loader scans ~/.pi/agent/extensions/
   ──► finds symlink → reads packages/mastery-coach/package.json
   ──► jiti loads src/index.ts
   ──► masteryCoachExtension(pi) registers 1 hook + 3 commands
   ──► Pi fires SessionStartEvent { reason: "startup" }
   ──► handler ▷ reason matches ▷ pi.sendUserMessage(MAIN_MENU_TEXT)
   ──► TUI shows menu
            │
            └─► LLM turn fires with menu as user input
```

**Scenario: User picks an origin**

```
[user types "/goal-oriented"]
   ──► Pi resolves command → goalOrientedCommand.handler("", ctx)
   ──► ctx.ui.notify("Not implemented yet", "info")
   ──► TUI shows notification
       (no graph write, no file write, no network, no state change)
```

**Scenario: Mid-session `/reload`**

```
[user runs `/reload`]
   ──► Pi tears down ──► session_shutdown { reason: "reload" } (we ignore)
   ──► Pi re-imports ──► factory re-runs ──► hooks + commands re-registered
   ──► Pi fires SessionStartEvent { reason: "reload" }
   ──► handler ▷ reason="reload" ▷ NO sendUserMessage call
   ──► Menu NOT re-rendered; commands remain invocable
```

**State Transitions (extension lifecycle):**

```
[unloaded] ── pi start ──▶ [factory invoked]
                                │
                                ▼
[hooks+commands registered] ── session_start("startup"|"new") ──▶ [menu sent]
                │
                └── session_start("reload"|"resume"|"fork") ──▶ [no-op]
                │
                └── /reload or quit ──▶ [unloaded]  (loops back)
```

---

### Architecture Decisions

#### Decision 1: Use `pi.extensions` manifest with `./src/index.ts` (not `./index.ts`)

**Status**: Accepted

**Context**: Pi's loader (`loader.ts:L473-490`) accepts a `package.json` `"pi": { "extensions": [...] }` manifest pointing to any resolvable file path. The `with-deps` example uses `./index.ts` (flat). Design § 1 mandates a nested `src/` layout.

**Options**:
1. Flat `./index.ts` matching the only existing example.
2. Nested `./src/index.ts` matching design § 1.
3. Both (`["./src/index.ts", "./index.ts"]`).

**Decision**: Use `"./src/index.ts"`. Design § 1 is the authority; the loader supports nested paths via `path.resolve(dir, extPath)` + `fs.existsSync`. The `with-deps` example is illustrative, not normative.

**Consequences**:
- All downstream source lives consistently under `src/*`.
- The path must physically exist; CI typecheck catches a missing file before runtime.
- Tests under `test/` are excluded from the manifest (Pi loads only the factory entry).

#### Decision 2: Modular per-command files over monolithic index.ts

**Status**: Accepted

**Context**: Three stub commands need handlers; design § 1 mandates `src/commands/`; downstream draft tasks already target that path.

**Options**:
1. Monolithic — three inline handlers in `index.ts`.
2. Modular — one file per command in `src/commands/`.
3. Registry array — `src/commands/index.ts` exports a list.

**Decision**: Modular (option 2). Aligns with design § 1, mirrors `examples/extensions/commands.ts`, simplest to test, simplest for downstream tasks to extend (replace handler body, not surgery on `index.ts`).

**Consequences**:
- Three small files (3-10 lines each) — minor file-count overhead.
- Unit tests can import command objects directly without spinning up the full factory.
- Each downstream coach task has a precise file to modify.

#### Decision 3: Bash-only link script honouring `PI_AGENT_DIR`

**Status**: Accepted

**Context**: Task spec mandates `$PI_AGENT_DIR`; Pi's actual env var is `PI_CODING_AGENT_DIR` (`config.ts:L452`). Cross-platform (PowerShell) is explicitly out of scope.

**Options**:
1. Honour `PI_AGENT_DIR` only (per task spec).
2. Honour both env vars with `PI_CODING_AGENT_DIR` taking precedence.
3. Honour `PI_CODING_AGENT_DIR` only.

**Decision**: Option 1 — honour `PI_AGENT_DIR` per spec; document the discrepancy in README so power users who override `PI_CODING_AGENT_DIR` also set `PI_AGENT_DIR`.

**Consequences**:
- Default flow (`~/.pi/agent`) is unaffected for either env var.
- Power users must read README before relocating their agent dir.
- Future enhancement (deferred): `${PI_AGENT_DIR:-${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}}`.

#### Decision 4: Tests live in `packages/mastery-coach/test/`, not `src/`

**Status**: Accepted

**Context**: Root `tsconfig.json` includes `"packages/*/src/**/*"` AND `"packages/*/test/**/*"`. Root `biome.json` mirrors. Existing packages (agent, ai, coding-agent, tui) all place tests under `test/`. The analysis document originally suggested `src/index.test.ts`; codebase convention and additional context correct this to `test/`.

**Options**:
1. `src/index.test.ts` (co-located).
2. `test/mastery-coach.test.ts` (matches convention and root include patterns).

**Decision**: Option 2.

**Consequences**:
- Test file is included by root tsconfig and biome.
- Matches every other package in the monorepo.
- Vitest naturally picks up `test/*.test.ts`.

---

### High-Level Structure

```
Feature: MVP mastery-coach scaffold
├── Entry Point: pi runtime → loader.ts → jiti → src/index.ts
├── Core Logic: 1 session_start hook + 3 registerCommand calls
├── Data Layer: none (no GraphDB, no Mochi, no secrets in MVP)
└── Output: TUI menu on startup + "Not implemented yet" on command invocation
```

---

### Workflow Steps

```
1. npm install            ──▶  2. bash link-extension.sh   ──▶  3. pi
       │                                │                          │
       ▼                                ▼                          ▼
[workspace registers          [symlink ~/.pi/agent/      [menu renders;
 mastery-coach package]        extensions/mastery-coach]  /commands work]
```

---

### Contracts

**ExtensionFactory contract** (consumed from `@earendil-works/pi-coding-agent`):
```typescript
type ExtensionFactory = (pi: ExtensionAPI) => void | Promise<void>;
```

**Command definition contract** (every `src/commands/*.ts` exports):
```typescript
interface CommandDefinition {
  name: string;                                    // e.g., "goal-oriented"
  description: string;                             // e.g., "Start a goal-oriented coaching session"
  handler: (args: string, ctx: ExtensionCommandContext) => Promise<void>;
}
```

**Menu prompt contract** (`src/prompts/main-menu.ts`):
```typescript
export const MAIN_MENU_TEXT: string;
// MUST contain literal substrings, in order: "1. Goal-oriented", "2. Practice Today", "3. Open Practice"
// MUST end with an instruction line directing apprentice to a slash command
```

**Pi manifest contract** (`package.json`):
```json
{
  "name": "mastery-coach",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "pi": { "extensions": ["./src/index.ts"] },
  "scripts": { "test": "vitest --run" }
}
```

**Link script contract** (`scripts/link-extension.sh`):
- Input env: `PI_AGENT_DIR` (optional, defaults to `$HOME/.pi/agent`).
- Behaviour: `mkdir -p "$EXTENSIONS_DIR"`, then `ln -sfn "$PACKAGE_DIR" "$EXTENSIONS_DIR/mastery-coach"`.
- Exit code: 0 on success (first and subsequent runs).
- Idempotent: re-runs replace the symlink in place via `-n` (no-dereference) + `-f` (force).

---

## Implementation Process

You MUST launch for each step a separate agent, instead of performing all steps yourself. And for each step marked as parallel, you MUST launch separate agents in parallel.

**CRITICAL:** For each agent you MUST:
1. Use the **Agent** type specified in the step (e.g., `haiku`, `sdd:developer`, `sdd:qa-engineer`, `opus`)
2. Provide path to task file and prompt which step to implement
3. Require agent to implement exactly that step, not more, not less, not other steps

### Parallelization Overview

```
Step 1: Directory skeleton [haiku]
    │
    ├───────────────────────┐
    ▼                       ▼
Step 2: package.json   Step 6: link-extension.sh
+ tsconfig.json        [sdd:developer]
[sdd:developer]        (Parallel with Step 2)
    │
    ├───────────────────────┐
    ▼                       ▼
Step 3:                Step 4:
MAIN_MENU_TEXT         Three command stubs
[sdd:developer]        [sdd:developer]
(Parallel with 4)      (3 sub-files MUST run in parallel)
    │                       │
    └───────────┬───────────┘
                ▼
        Step 5: src/index.ts factory
        [sdd:developer]
                │
                ├───────────────────────┐
                ▼                       ▼
        Step 7: tests            Step 8: README
        [sdd:qa-engineer]        [opus]
        (Parallel with 8)        (Parallel with 7)
                │                       │
                └───────────┬───────────┘
                            ▼
                  Step 9: E2E verification
                  [sdd:qa-engineer]
```

**Maximum concurrent agents at peak**: 3 (within Step 4's sub-task parallelization)

---

### Decomposition Chain (Least-to-Most)

This task is a single vertical slice (walking-skeleton). The chain below shows the explicit subproblem ordering used to derive the 9 implementation steps:

**Level 0 (zero-dependency leaves):**
- L0.1 — Directory skeleton + `.gitkeep` placeholders (pure structure)
- L0.2 — `MAIN_MENU_TEXT` constant (pure data string)
- L0.3 — `package.json` (workspace + Pi manifest)
- L0.4 — `tsconfig.json` (extends base, depends on L0.3 conceptually only — the file exists adjacent)

**Level 1 (built on L0):**
- L1.1 — Symlink script (uses package dir from L0.1 + L0.3)
- L1.2 — Three command stub modules (depend on `src/commands/` from L0.1 and TS toolchain from L0.4; use type-only `ExtensionCommandContext`)
- L1.3 — `src/index.ts` factory (composes L0.2 + L1.2; registers session_start hook + 3 commands)

**Level 2:**
- L2.1 — `test/mastery-coach.test.ts` (asserts behaviours produced by L0.2, L1.2, L1.3)

**Level 3:**
- L3.1 — README (documents L0.1 layout, L1.1 script, L2.1 test invocation)
- L3.2 — End-to-end verification (validates every prior artifact)

**Dependency table:**

| Level | Subproblem | Depends On | Why This Order |
|-------|------------|------------|----------------|
| 0 | L0.1 Directory skeleton + .gitkeeps | — | Foundation for src/test paths |
| 0 | L0.2 MAIN_MENU_TEXT constant | — | Pure data; consumed by L1.3 and L2.1 |
| 0 | L0.3 package.json | — | Required for workspace + Pi discovery |
| 0 | L0.4 tsconfig.json | L0.3 | Extends base; required for typecheck |
| 1 | L1.1 link-extension.sh | L0.1, L0.3 | Needs package dir + manifest |
| 1 | L1.2 Per-command handler files | L0.1, L0.4 | Needs `src/commands/` and TS to compile |
| 1 | L1.3 src/index.ts factory | L0.2, L0.4, L1.2 | Imports menu text + each command module |
| 2 | L2.1 Unit tests | L0.2, L1.2, L1.3 | Tests the L0/L1 artifacts |
| 3 | L3.1 README | L0.1, L1.1, L2.1 | Documents how to use everything |
| 3 | L3.2 E2E verification | All | Final sign-off |

### Implementation Strategy

**Approach**: Bottom-Up (Building-Blocks-First), with Inside-Out for the factory.

**Rationale**: The factory (`src/index.ts`) is the integration point that composes the menu text constant and the per-command modules. Each leaf is small, pure, and trivially testable in isolation. Building leaves first means the factory becomes a straightforward assembly of known-good parts and the only new logic at that point is the `event.reason` filter and three `registerCommand` calls. Catching a stray value import (vs `import type`) in a leaf module is cheaper than catching it at integration time.

### Phase Overview

```
Phase 1: Setup
    │  (Steps 1, 2 — dirs + manifests)
    ▼
Phase 2: Foundation
    │  (Steps 3, 4 — pure leaves: menu text + command stubs)
    ▼
Phase 3: Integration
    │  (Steps 5, 6 — factory + symlink script)
    ▼
Phase 4: Testing
    │  (Step 7 — vitest smoke coverage)
    ▼
Phase 5: Polish
       (Steps 8, 9 — README + E2E verification)
```

---

### Step 1: Create directory skeleton with .gitkeep placeholders

**Model:** haiku
**Agent:** haiku
**Depends on:** None
**Parallel with:** None (foundation step — must complete before any other step)

**Goal**: Establish the physical directory layout from design § 1 so each downstream draft task has a home and the package-level `find` reflects the design contract.

#### Expected Output
- Package root: `packages/mastery-coach/`
- Subdirectories: `src/prompts/`, `src/commands/`, `src/tools/`, `src/domain/`, `src/decay/`, `src/ontology/`, `infra/`, `scripts/`, `test/`
- `.gitkeep` files in directories that are empty in this MVP: `src/tools/.gitkeep`, `src/domain/.gitkeep`, `src/decay/.gitkeep`, `src/ontology/.gitkeep`, `infra/.gitkeep`

#### Success Criteria
- [ ] `packages/mastery-coach/` exists
- [ ] All 9 subdirectories from design § 1 exist
- [ ] `find packages/mastery-coach -name .gitkeep | wc -l` returns 5
- [ ] `src/prompts/`, `src/commands/`, `scripts/`, `test/` will receive real files in later steps and do NOT need `.gitkeep`

#### Subtasks
- [ ] Create directory `packages/mastery-coach/src/prompts/`
- [ ] Create directory `packages/mastery-coach/src/commands/`
- [ ] Create directory `packages/mastery-coach/src/tools/` with `.gitkeep`
- [ ] Create directory `packages/mastery-coach/src/domain/` with `.gitkeep`
- [ ] Create directory `packages/mastery-coach/src/decay/` with `.gitkeep`
- [ ] Create directory `packages/mastery-coach/src/ontology/` with `.gitkeep`
- [ ] Create directory `packages/mastery-coach/infra/` with `.gitkeep`
- [ ] Create directory `packages/mastery-coach/scripts/`
- [ ] Create directory `packages/mastery-coach/test/`

#### Blockers
- None — purely additive filesystem operations.

#### Risks
- Forgetting a `.gitkeep` causes the directory to vanish on commit, breaking design § 1 conformance. Mitigation: enumerate the 5 `.gitkeep` files explicitly in subtasks and verify via `find`.

#### Complexity
Small (S)

#### Dependencies
None.

#### Uncertainty Rating
Low

#### Integration Points
- Provides physical homes for all downstream draft tasks (SPARQL tools in `src/tools/`, ontology in `src/ontology/`, etc.).

#### Definition of Done
- [ ] All 9 subdirectories exist
- [ ] 5 `.gitkeep` files committed in the empty ones
- [ ] Layout verified against design § 1 (no missing/extra dirs)
- [ ] Behaviour covered by Step 9 (E2E `find` check on directory tree)

#### Verification

**Level:** NOT NEEDED
**Rationale:** Pure filesystem operation. Success is binary and trivially verifiable via the `find packages/mastery-coach -name .gitkeep | wc -l` check (must equal 5) plus directory existence checks, both of which are explicitly executed in Step 9's E2E verification. No qualitative judgment is required — directories either exist or don't, and the `find` count is deterministic.

---

### Step 2: Add package.json and tsconfig.json

**Model:** opus
**Agent:** sdd:developer
**Depends on:** Step 1
**Parallel with:** Step 6

**Goal**: Register the package with the npm workspace, declare the Pi extension manifest, and configure TypeScript so `tsgo --noEmit` succeeds across the new package.

#### Expected Output
- `packages/mastery-coach/package.json` — name, private, type: module, version, Pi manifest, scripts (test/clean/build/check), vitest devDep.
- `packages/mastery-coach/tsconfig.json` — extends `../../tsconfig.base.json`, `"noEmit": true`, `include: ["src", "test"]`.

#### Success Criteria
- [ ] `package.json` contains `"name": "mastery-coach"`, `"private": true`, `"type": "module"`, `"version": "0.1.0"`
- [ ] `package.json` contains `"pi": { "extensions": ["./src/index.ts"] }`
- [ ] `package.json` contains `"scripts": { "test": "vitest --run", "clean": "echo 'nothing to clean'", "build": "echo 'nothing to build'", "check": "echo 'nothing to check'" }`
- [ ] `package.json` contains `"devDependencies": { "vitest": "3.2.4" }`
- [ ] `tsconfig.json` extends `../../tsconfig.base.json`, sets `compilerOptions.noEmit: true`, sets `include: ["src", "test"]`
- [ ] `npm install` at repo root exits 0 and the `mastery-coach` workspace is recognised
- [ ] `npx tsgo --noEmit` at repo root exits 0 (no errors introduced by the new package; existing errors unchanged)

#### Subtasks
- [ ] Write `packages/mastery-coach/package.json`
- [ ] Write `packages/mastery-coach/tsconfig.json`
- [ ] Run `npm install` from repo root and verify exit 0
- [ ] Run `npx tsgo --noEmit` from repo root and verify exit 0

#### Blockers
- Lockfile churn from `npm install`. Mitigation: commit the resulting `package-lock.json` change as part of the task.

#### Risks
- Forgetting `"type": "module"` breaks ESM interop in jiti. Mitigation: it is in the explicit Success Criteria checklist.
- Choosing a vitest version mismatched with the monorepo could trigger duplicate installs. Mitigation: pin to `3.2.4` (matches `packages/ai/package.json`).

#### Complexity
Small (S)

#### Dependencies
Step 1.

#### Uncertainty Rating
Low

#### Integration Points
- Root `package.json` workspace glob (`packages/*`) — already covers this package; no root edit needed.
- Root `tsconfig.json` include (`packages/*/src/**/*`, `packages/*/test/**/*`) — already covers; no root edit needed.
- Pi loader manifest discovery (`loader.ts:L473-490`) consumes `pi.extensions`.

#### Definition of Done
- [ ] Both files created
- [ ] `npm install` succeeds
- [ ] `tsgo --noEmit` succeeds
- [ ] `package-lock.json` change committed
- [ ] Behaviour covered by Step 9 (final lint + typecheck)

#### Verification

**Level:** Single Judge
**Artifacts:** `packages/mastery-coach/package.json`, `packages/mastery-coach/tsconfig.json`
**Threshold:** 4.0/5.0

**Rubric:**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Pi Manifest Correctness | 0.30 | `pi.extensions` array contains exactly `"./src/index.ts"`; `"type": "module"` present; `"private": true` present; `"name": "mastery-coach"`; `"version": "0.1.0"` |
| TSConfig Correctness | 0.25 | Extends `../../tsconfig.base.json`; sets `compilerOptions.noEmit: true`; `include: ["src", "test"]` |
| Workspace + Dependency Health | 0.20 | vitest pinned to `3.2.4` (matches `packages/ai`); `npm install` produces no resolution warnings; package-lock churn limited to new package |
| Scripts Completeness | 0.15 | All four scripts present (`test`, `clean`, `build`, `check`) with the specified values |
| Static Checks Pass | 0.10 | `npx tsgo --noEmit` exits 0 with no new errors introduced |

**Reference Patterns:** `packages/coding-agent/examples/extensions/with-deps/package.json` (Pi `pi.extensions` manifest precedent); `packages/ai/package.json` (vitest version pinning)

---

### Step 3: Add MAIN_MENU_TEXT constant in src/prompts/main-menu.ts

**Model:** opus
**Agent:** sdd:developer
**Depends on:** Step 2
**Parallel with:** Step 4

**Goal**: Provide the immutable, static menu string the session_start hook will send to the apprentice.

#### Expected Output
- `packages/mastery-coach/src/prompts/main-menu.ts` — exports `export const MAIN_MENU_TEXT: string` containing the header, the three numbered options, and a one-line instruction line.

#### Success Criteria
- [ ] File `src/prompts/main-menu.ts` exists
- [ ] `MAIN_MENU_TEXT` is exported as a `const` of type `string`
- [ ] The string contains the literal substring `"1. Goal-oriented"` BEFORE `"2. Practice Today"` BEFORE `"3. Open Practice"` (order verifiable via `indexOf`)
- [ ] The string ends with an instruction line directing the apprentice to invoke the corresponding slash command (`/goal-oriented`, `/practice-today`, or `/open-practice`) for their chosen option
- [ ] File uses tab indentation; no line exceeds 120 chars; passes `biome check`

#### Subtasks
- [ ] Write `packages/mastery-coach/src/prompts/main-menu.ts`

#### Blockers
- None.

#### Risks
- Instruction wording could drift from acceptance criteria. Mitigation: quote the acceptance text verbatim in a file comment.

#### Complexity
Small (S)

#### Dependencies
Steps 1, 2.

#### Uncertainty Rating
Low

#### Integration Points
- Consumed by `src/index.ts` factory (Step 5)
- Asserted by `test/mastery-coach.test.ts` (Step 7)

#### Definition of Done
- [ ] File created with correct content and ordering
- [ ] biome lint clean
- [ ] Behaviour covered by Step 7 unit test on `MAIN_MENU_TEXT` content + ordering

#### Verification

**Level:** Single Judge
**Artifact:** `packages/mastery-coach/src/prompts/main-menu.ts`
**Threshold:** 4.0/5.0

**Rubric:**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Contract Conformance | 0.40 | Exports `const MAIN_MENU_TEXT: string`; contains literal substrings `"1. Goal-oriented"`, `"2. Practice Today"`, `"3. Open Practice"` in that exact order (verifiable via `indexOf`); ends with an instruction line directing the apprentice to invoke `/goal-oriented`, `/practice-today`, or `/open-practice` |
| Apprentice-Facing Clarity | 0.25 | Menu reads naturally to a human apprentice; header is meaningful (e.g., "Mastery Coach"); instruction line is unambiguous |
| Code Hygiene | 0.20 | Tab indentation; no line exceeds 120 chars; biome check clean; single named export |
| Determinism / No I/O | 0.15 | Constant is purely static; no template literals computing from env, no side effects on module load |

**Reference Pattern:** `packages/coding-agent/examples/extensions/send-user-message.ts` (static-string message construction)

---

### Step 4: Add three command stub modules in src/commands/

**Model:** opus
**Agent:** sdd:developer
**Depends on:** Step 2
**Parallel with:** Step 3
**Note:** The three command files are independent leaves. Individual command files MUST be written in parallel by 3 separate sub-agents.

#### Sub-task Parallelization

| Sub-task | File | Description | Agent | Can Parallel |
|----------|------|-------------|-------|--------------|
| 4a | `src/commands/goal-oriented.ts` | Stub handler for `/goal-oriented` | sdd:developer | Yes |
| 4b | `src/commands/practice-today.ts` | Stub handler for `/practice-today` | sdd:developer | Yes |
| 4c | `src/commands/open-practice.ts` | Stub handler for `/open-practice` | sdd:developer | Yes |

**Goal**: One file per slash command, each exporting a command definition object whose handler surfaces exactly `Not implemented yet` via `ctx.ui.notify` and does nothing else.

#### Expected Output
- `packages/mastery-coach/src/commands/goal-oriented.ts` exports `goalOrientedCommand: { name: "goal-oriented", description: "Start a goal-oriented coaching session", handler }`
- `packages/mastery-coach/src/commands/practice-today.ts` exports `practiceTodayCommand: { name: "practice-today", description: "Propose today's practice based on skill decay", handler }`
- `packages/mastery-coach/src/commands/open-practice.ts` exports `openPracticeCommand: { name: "open-practice", description: "Open-ended practice session", handler }`

#### Success Criteria
- [ ] All three files exist
- [ ] Each file uses `import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent"` (type-only)
- [ ] Each handler signature is `async (_args: string, ctx: ExtensionCommandContext): Promise<void>`
- [ ] Each handler body calls `ctx.ui.notify("Not implemented yet", "info")` as its sole observable effect
- [ ] Each handler does not call any other ctx/UI method, does not perform file/network I/O, does not write to globals
- [ ] No `any` types anywhere in the three files
- [ ] `npx tsgo --noEmit` exits 0
- [ ] `npx biome check packages/mastery-coach/src` exits 0 with no warnings or errors

#### Subtasks
- [ ] Write `packages/mastery-coach/src/commands/goal-oriented.ts`
- [ ] Write `packages/mastery-coach/src/commands/practice-today.ts`
- [ ] Write `packages/mastery-coach/src/commands/open-practice.ts`
- [ ] Verify with `npx tsgo --noEmit`
- [ ] Verify with `npx biome check packages/mastery-coach/src`

#### Blockers
- None.

#### Risks
- Accidentally using value import (not type-only) of `@earendil-works/pi-coding-agent` -> jiti runtime failure. Mitigation: every import must be `import type`; verified by `tsgo --noEmit` + review.
- biome formatting (tabs, lineWidth 120) easily violated by IDE defaults. Mitigation: run `biome check --write` and commit the result.

#### Complexity
Small (S)

#### Dependencies
Steps 1, 2.

#### Uncertainty Rating
Low

#### Integration Points
- Imported by `src/index.ts` factory (Step 5).
- Asserted by `test/mastery-coach.test.ts` (Step 7).
- All three are parallelisable.

#### Definition of Done
- [ ] All three command modules created
- [ ] Type-only imports verified
- [ ] tsgo + biome clean
- [ ] Behaviour covered by Step 7 unit tests (notify called once with correct args; no other effects)

#### Verification

**Level:** Per-Command Judges (3 separate evaluations in parallel — one per command file)
**Artifacts:** `packages/mastery-coach/src/commands/{goal-oriented,practice-today,open-practice}.ts`
**Threshold:** 4.0/5.0

**Rubric (per command file):**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Stub Behaviour Correctness | 0.30 | Handler signature is `async (_args: string, ctx: ExtensionCommandContext): Promise<void>`; body calls `ctx.ui.notify("Not implemented yet", "info")` exactly once as the sole observable effect |
| Type-Only Import Discipline | 0.25 | Imports `ExtensionCommandContext` from `@earendil-works/pi-coding-agent` using `import type` (NOT a value import — a value import causes jiti runtime failure when Pi loads the extension) |
| Surface Restriction (Negative Constraints) | 0.20 | Handler does NOT call any other ctx/UI method; does NOT perform file/network I/O; does NOT write to globals; no `any` types anywhere in the file |
| Export Shape Conformance | 0.15 | Exports correctly-named const (`goalOrientedCommand` / `practiceTodayCommand` / `openPracticeCommand`) with the shape `{ name, description, handler }`; `name` is the kebab-case slash command name (`"goal-oriented"`, `"practice-today"`, `"open-practice"`); `description` matches the task-spec wording for that command |
| Code Hygiene | 0.10 | `npx tsgo --noEmit` clean; `npx biome check` clean; tab indentation; type-only import discipline visibly preserved in source |

**Reference Pattern:** `packages/coding-agent/examples/extensions/commands.ts` (registerCommand + ctx.ui.notify precedent)

---

### Step 5: Implement extension factory in src/index.ts

**Model:** opus
**Agent:** sdd:developer
**Depends on:** Steps 3, 4
**Parallel with:** None (integration point — sequential after Steps 3 and 4)

**Goal**: Wire one `session_start` hook (filtered on `reason`) and three `registerCommand` calls, performing zero I/O at factory top-level.

#### Expected Output
- `packages/mastery-coach/src/index.ts` — default-exports a function `masteryCoachExtension(pi: ExtensionAPI): void`.

#### Success Criteria
- [ ] File `src/index.ts` exists
- [ ] Imports `ExtensionAPI` from `@earendil-works/pi-coding-agent` using `import type`
- [ ] Imports `MAIN_MENU_TEXT` from `./prompts/main-menu.ts`
- [ ] Imports `goalOrientedCommand`, `practiceTodayCommand`, `openPracticeCommand` from `./commands/goal-oriented.ts`, `./commands/practice-today.ts`, `./commands/open-practice.ts`
- [ ] Default-exports `function masteryCoachExtension(pi: ExtensionAPI): void`
- [ ] Calls `pi.on("session_start", handler)` exactly once
- [ ] The handler checks `event.reason === "startup" || event.reason === "new"` before calling `pi.sendUserMessage(MAIN_MENU_TEXT)`
- [ ] Calls `pi.registerCommand(name, { description, handler })` exactly three times, once for each of the imported command objects
- [ ] Does NOT call `pi.registerTool`
- [ ] Does NOT call `pi.registerMessageRenderer`
- [ ] Does NOT register any other `pi.on(...)` event handler
- [ ] Does NOT perform any I/O at module top-level (no `fs`, `network`, no `pi.sendUserMessage` outside the handler)
- [ ] `npx tsgo --noEmit` exits 0
- [ ] `npx biome check packages/mastery-coach/src` exits 0

#### Subtasks
- [ ] Write `packages/mastery-coach/src/index.ts`
- [ ] Verify with `npx tsgo --noEmit`
- [ ] Verify with `npx biome check packages/mastery-coach/src`
- [ ] Manually review: count of `pi.on` calls = 1, count of `pi.registerCommand` calls = 3, count of `pi.registerTool` calls = 0

#### Blockers
- None.

#### Risks
- Calling `pi.sendUserMessage` at factory top-level -> "Extension runtime not initialized". Mitigation: explicit Success Criteria item; reviewed manually.
- Missing the `reason` filter -> menu re-renders on `/reload`, violating AC. Mitigation: explicit Success Criteria; Step 7 asserts all 5 reasons.

#### Complexity
Small (S)

#### Dependencies
Steps 3, 4.

#### Uncertainty Rating
Low

#### Integration Points
- Pi loader (`packages/coding-agent/src/core/extensions/loader.ts`) — invokes the default export with the `ExtensionAPI`.
- jiti runtime — transpiles this TS at extension load time.

#### Definition of Done
- [ ] File created
- [ ] All imports are type-only or from local `./...ts` paths
- [ ] tsgo + biome clean
- [ ] Surface restrictions manually verified (1 hook, 3 commands, 0 tools, 0 renderers)
- [ ] Behaviour covered by Step 7 tests (registration counts + reason filter)

#### Verification

**Level:** CRITICAL - Panel of 2 Judges with Aggregated Voting
**Artifact:** `packages/mastery-coach/src/index.ts`
**Threshold:** 4.0/5.0

**Rubric:**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Integration Correctness | 0.25 | Default-exports `function masteryCoachExtension(pi: ExtensionAPI): void`; imports `ExtensionAPI` as `import type` from `@earendil-works/pi-coding-agent`; imports `MAIN_MENU_TEXT` and the three command objects from local `./prompts/main-menu.ts` and `./commands/*.ts` paths |
| Session_Start Reason Filter | 0.25 | Handler checks `event.reason === "startup"` OR `event.reason === "new"` before calling `pi.sendUserMessage(MAIN_MENU_TEXT)`; explicitly rejects `"reload"`, `"resume"`, `"fork"` so the menu does NOT re-render on `/reload` (acceptance criterion: "Alternative Flow B") |
| Surface Restriction (MVP scope) | 0.25 | Exactly 1 `pi.on("session_start", ...)` call; exactly 3 `pi.registerCommand(...)` calls (one per imported command); 0 `pi.registerTool` calls; 0 `pi.registerMessageRenderer` calls; no other `pi.on(...)` event handlers (`before_agent_start`, `session_shutdown`, `message_end`, `tool_result`, `context`, `input`, `agent_start`, `agent_end` all absent) |
| No Top-Level I/O | 0.15 | No filesystem reads, no network calls, no `pi.sendUserMessage` call outside the registered handler; nothing happens at module evaluation beyond `import` statements and `pi.on` + `pi.registerCommand` registrations (avoids "Extension runtime not initialized" error) |
| Code Hygiene | 0.10 | `npx tsgo --noEmit` clean; `npx biome check` clean; type-only imports preserved; no `any` types; tab indentation |

**Reference Pattern:** `packages/coding-agent/examples/extensions/plan-mode/index.ts` (lines 291–338: session_start hook registration + `event.reason` filter pattern)

---

### Step 6: Add idempotent symlink script in scripts/link-extension.sh

**Model:** opus
**Agent:** sdd:developer
**Depends on:** Step 1
**Parallel with:** Step 2 (and transitively with Steps 3, 4 while they execute)

**Goal**: Provide a one-command symlink that makes Pi discover the extension globally, honours `PI_AGENT_DIR`, and is safe to re-run.

#### Expected Output
- `packages/mastery-coach/scripts/link-extension.sh` — executable bash script.

#### Success Criteria
- [ ] File `scripts/link-extension.sh` exists
- [ ] Starts with `#!/usr/bin/env bash` and `set -euo pipefail`
- [ ] Resolves `EXTENSIONS_DIR="${PI_AGENT_DIR:-$HOME/.pi/agent}/extensions"`
- [ ] Resolves `PACKAGE_DIR="$(cd "$(dirname "$0")/.." && pwd)"`
- [ ] Runs `mkdir -p "$EXTENSIONS_DIR"` before symlinking
- [ ] Runs `ln -sfn "$PACKAGE_DIR" "$EXTENSIONS_DIR/mastery-coach"`
- [ ] Echoes the resulting `EXTENSIONS_DIR/mastery-coach -> PACKAGE_DIR` mapping on stdout
- [ ] Has the executable bit set (`chmod +x`)
- [ ] Manual test: first invocation exits 0; second invocation also exits 0 and produces no duplicate entry; `readlink ~/.pi/agent/extensions/mastery-coach` resolves to the absolute `packages/mastery-coach/` path

#### Subtasks
- [ ] Write `packages/mastery-coach/scripts/link-extension.sh`
- [ ] `chmod +x packages/mastery-coach/scripts/link-extension.sh`
- [ ] Run the script twice in a clean environment and verify same symlink + exit 0 both times

#### Blockers
- None.

#### Risks
- Missing `mkdir -p` if `~/.pi/agent/extensions/` doesn't exist -> `ln` fails. Mitigation: explicit Success Criteria item.
- Symlink target path resolution wrong if script invoked from outside its directory. Mitigation: use `$(cd "$(dirname "$0")/.." && pwd)`.

#### Complexity
Small (S)

#### Dependencies
Step 1 (package directory must exist as the symlink target). Note: end-to-end discovery validation in Step 9 requires Step 2's manifest, but writing this script does not.

#### Uncertainty Rating
Low

#### Integration Points
- Pi loader discovers the symlinked subdirectory under `~/.pi/agent/extensions/` (`loader.ts:L535` follows symlinks).
- Parallel-friendly: MUST be written alongside Step 2 (both depend only on Step 1).

#### Definition of Done
- [ ] Script created and executable
- [ ] Idempotency verified by running twice
- [ ] Behaviour covered by Step 9 (E2E `pi` launch confirms extension discovery)

#### Verification

**Level:** Single Judge
**Artifact:** `packages/mastery-coach/scripts/link-extension.sh`
**Threshold:** 4.0/5.0

**Rubric:**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Idempotency | 0.30 | Uses `ln -sfn` (force + no-dereference) so re-runs replace the symlink in place without error; uses `mkdir -p` so missing parent directories are auto-created; second invocation exits 0 with no duplicate entries (validated by manual two-run test) |
| Env Var + Path Resolution | 0.25 | Resolves `EXTENSIONS_DIR="${PI_AGENT_DIR:-$HOME/.pi/agent}/extensions"` (honours override, defaults to home); resolves `PACKAGE_DIR="$(cd "$(dirname "$0")/.." && pwd)"` so the script works correctly when invoked from any working directory |
| Safety / Defensive Bash | 0.20 | Starts with `#!/usr/bin/env bash` shebang; sets `set -euo pipefail` to fail fast on errors / undefined vars / pipeline failures; has the executable bit set (`chmod +x`); echoes the resulting `EXTENSIONS_DIR/mastery-coach -> PACKAGE_DIR` mapping on stdout for operator confirmation |
| Symlink Target Correctness | 0.15 | The final symlink `${EXTENSIONS_DIR}/mastery-coach` resolves to the absolute `packages/mastery-coach/` directory (not relative, not pointing into `scripts/` or `src/`); `readlink` on the link returns the absolute package directory |
| Scope Discipline | 0.10 | Does NOT attempt cross-platform (Windows/PowerShell) handling (explicitly out of scope per task spec); does NOT perform any operation beyond `mkdir -p` + `ln -sfn` + stdout echo |

**Reference Pattern:** None (no existing project precedent — standard idempotent symlink bash pattern from POSIX conventions)

---

### Step 7: Unit/smoke tests in test/mastery-coach.test.ts

**Model:** opus
**Agent:** sdd:qa-engineer
**Depends on:** Step 5 (transitively covers Steps 3, 4)
**Parallel with:** Step 8

**Goal**: Lock down the three observable contracts — menu text content/ordering, command stub reply, session_start reason filtering — using vitest with a mocked `ExtensionAPI`.

#### Expected Output
- `packages/mastery-coach/test/mastery-coach.test.ts` — vitest file with four describe blocks.

#### Success Criteria
- [ ] File `test/mastery-coach.test.ts` exists
- [ ] Uses `import { describe, it, expect, vi } from "vitest"`
- [ ] Defines minimal mock `ExtensionAPI` with `on`, `registerCommand`, `registerTool`, `sendUserMessage`, `registerMessageRenderer` as `vi.fn()` spies
- [ ] Defines minimal mock `ExtensionCommandContext` with `ui.notify` as `vi.fn()` spy
- [ ] Describe block 1 ("MAIN_MENU_TEXT"): asserts `MAIN_MENU_TEXT.indexOf("1. Goal-oriented") < MAIN_MENU_TEXT.indexOf("2. Practice Today") < MAIN_MENU_TEXT.indexOf("3. Open Practice")` and asserts the instruction line is present
- [ ] Describe block 2 ("command stubs"): parameterised over the 3 commands; for each, invokes `handler("", mockCtx)` and asserts `mockCtx.ui.notify` was called exactly once with arguments `("Not implemented yet", "info")` and no other mock method was called
- [ ] Describe block 3 ("factory registration"): invokes the default factory with the mock `pi`; asserts `pi.on` called with `"session_start"` exactly once, `pi.registerCommand` called exactly three times with names `"goal-oriented"`, `"practice-today"`, `"open-practice"`, `pi.registerTool` not called, `pi.registerMessageRenderer` not called
- [ ] Describe block 4 ("session_start reason filtering"): captures the registered session_start handler; invokes it with each of `reason ∈ {"startup", "new", "reload", "resume", "fork"}`; asserts `pi.sendUserMessage` called for `"startup"` and `"new"` only and called with `MAIN_MENU_TEXT`
- [ ] `cd packages/mastery-coach && npm test` exits 0
- [ ] biome lint clean on the test file

#### Subtasks
- [ ] Build mock `ExtensionAPI` factory helper in the test file
- [ ] Build mock `ExtensionCommandContext` factory helper in the test file
- [ ] Write describe block 1 (MAIN_MENU_TEXT content + ordering)
- [ ] Write describe block 2 (command handler stubs — parameterised)
- [ ] Write describe block 3 (factory registration surface)
- [ ] Write describe block 4 (session_start reason filtering across all 5 reasons)
- [ ] Run `cd packages/mastery-coach && npm test` and verify exit 0

#### Blockers
- None.

#### Risks
- Mock shape drifts from real `ExtensionAPI` if upstream types change. Mitigation: use `Partial<ExtensionAPI>` cast at the call boundary; document mock surface used.
- Test file in `src/` instead of `test/` would break root tsconfig/biome convention. Mitigation: file path explicitly under `test/` per Decision 4.

#### Complexity
Medium (M)

#### Dependencies
Steps 3, 4, 5.

#### Uncertainty Rating
Low

#### Integration Points
- Root tsconfig include `packages/*/test/**/*` covers this file.
- Root biome include covers this file.
- vitest from `devDependencies` in Step 2 runs it.

#### Definition of Done
- [ ] Test file created
- [ ] All four describe blocks present
- [ ] `npm test` passes for the package
- [ ] biome clean

#### Verification

**Level:** Single Judge
**Artifact:** `packages/mastery-coach/test/mastery-coach.test.ts`
**Threshold:** 4.0/5.0

**Rubric:**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Contract Coverage (4 describe blocks) | 0.30 | All four describe blocks present: (1) `MAIN_MENU_TEXT` ordering + instruction-line, (2) three command stubs parameterised, (3) factory registration surface counts (1 hook, 3 commands, 0 tools, 0 renderers), (4) session_start `event.reason` filter across all 5 reasons (`startup`, `new`, `reload`, `resume`, `fork`) |
| Mock Quality | 0.25 | Mock `ExtensionAPI` includes `on`, `registerCommand`, `registerTool`, `sendUserMessage`, `registerMessageRenderer` as `vi.fn()` spies; mock `ExtensionCommandContext` includes `ui.notify` spy; uses `Partial<ExtensionAPI>` cast at the call boundary; mock shape mirrors the real API surface from `packages/coding-agent/src/core/extensions/types.ts` |
| Assertion Specificity | 0.20 | Asserts exact call arguments (e.g., `notify("Not implemented yet", "info")`); asserts exact call counts (1 hook, 3 commands, 0 tools, 0 renderers); asserts substring ordering via `indexOf` comparison; asserts `sendUserMessage` called only for `startup`/`new` reasons and with `MAIN_MENU_TEXT` as argument |
| Test Isolation + Convention | 0.15 | File located at `test/mastery-coach.test.ts` (matches root `tsconfig.json` and `biome.json` include patterns, NOT under `src/`); each test independent; `vi.fn()` mocks reset per test where appropriate |
| Test Execution + Quality | 0.10 | `cd packages/mastery-coach && npm test` exits 0; biome lint clean on the test file; no `any` types in mocks or assertions |

**Reference Pattern:** Existing test files in the monorepo (e.g., `packages/ai/test/`, `packages/coding-agent/test/`) for vitest + mock conventions

---

### Step 8: Add README.md

**Model:** opus
**Agent:** opus
**Depends on:** Steps 5, 6
**Parallel with:** Step 7

**Goal**: Document setup, symlink, env-var caveat, and the placeholder subdirectory layout so downstream task owners know where to add their code.

#### Expected Output
- `packages/mastery-coach/README.md`.

#### Success Criteria
- [ ] File `README.md` exists in `packages/mastery-coach/`
- [ ] Includes a Getting Started section with the steps: (1) `npm install` at repo root; (2) `bash packages/mastery-coach/scripts/link-extension.sh`; (3) start `pi` and observe the menu; (4) invoke each of the three slash commands
- [ ] Lists the three slash commands with their descriptions
- [ ] Documents the env-var note: `PI_AGENT_DIR` is honoured by the link script; Pi internally uses `PI_CODING_AGENT_DIR`; both default to `~/.pi/agent/`; users overriding `PI_CODING_AGENT_DIR` should also set `PI_AGENT_DIR`
- [ ] Documents the placeholder subdirectory layout (`src/tools`, `src/domain`, `src/decay`, `src/ontology`, `infra`) and that downstream draft tasks land there
- [ ] Documents how to run tests (`cd packages/mastery-coach && npm test`)
- [ ] Does NOT mention features that are out of scope for the MVP (no GraphDB, no Mochi, no decay, etc.)

#### Subtasks
- [ ] Write `packages/mastery-coach/README.md`

#### Blockers
- None.

#### Risks
- README drifting from acceptance scope (e.g. claiming features not built). Mitigation: cross-check against the task's Scope > Excluded list.

#### Complexity
Small (S)

#### Dependencies
Steps 5, 6.

#### Uncertainty Rating
Low

#### Integration Points
- Parallel with Step 7 (can be written in parallel).

#### Definition of Done
- [ ] README created
- [ ] All five required content sections present
- [ ] Cross-checked against task's Excluded list (no scope creep claims)

#### Verification

**Level:** Single Judge
**Artifact:** `packages/mastery-coach/README.md`
**Threshold:** 4.0/5.0

**Rubric:**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Required Section Completeness | 0.30 | Getting Started section walks through all 4 steps (`npm install` at repo root, `bash packages/mastery-coach/scripts/link-extension.sh`, start `pi`, invoke each command); three slash commands listed with descriptions; placeholder subdirectory layout documented; "how to run tests" section present (`cd packages/mastery-coach && npm test`); env-var caveat present |
| Scope Discipline (no over-claiming) | 0.25 | Does NOT mention GraphDB, Mochi, decay calculator, SPARQL, ontology, secrets, gates, heatmap, `/review-goals`, `/exit-mastery-mode`, or any other Excluded feature; cross-checked against the task's `Scope > Excluded` list |
| Env-Var Caveat Accuracy | 0.20 | Correctly notes that the link script honours `PI_AGENT_DIR` while Pi itself reads `PI_CODING_AGENT_DIR`; both default to `~/.pi/agent/`; advises power users overriding `PI_CODING_AGENT_DIR` to also set `PI_AGENT_DIR` for the link script |
| Clarity for Downstream Task Owners | 0.15 | Placeholder subdirs (`src/tools`, `src/domain`, `src/decay`, `src/ontology`, `infra`) explained as homes for downstream draft tasks; a reader unfamiliar with the design doc can infer where new code lands |
| Markdown Quality | 0.10 | Headings hierarchically structured; shell commands in fenced code blocks; no broken cross-references; tone matches other monorepo READMEs |

**Reference Patterns:** `packages/agent/README.md`, `packages/coding-agent/README.md` (existing package README conventions in this monorepo)

---

### Step 9: End-to-end verification

**Model:** opus
**Agent:** sdd:qa-engineer
**Depends on:** Steps 7, 8 (transitively requires all prior steps)
**Parallel with:** None (final integration gate)

**Goal**: Run every static check, every test, both link-script invocations, and a manual `pi` launch to validate all acceptance criteria pass.

#### Expected Output
- A verification log (in PR description / commit message) listing each check and its exit code / observation.

#### Success Criteria
- [ ] `npm install` at repo root exits 0
- [ ] `npx tsgo --noEmit` at repo root exits 0
- [ ] `npx biome check --write --error-on-warnings .` exits 0 (no new warnings/errors introduced)
- [ ] `node scripts/check-ts-relative-imports.mjs` exits 0
- [ ] `cd packages/mastery-coach && npm test` exits 0
- [ ] `bash packages/mastery-coach/scripts/link-extension.sh` exits 0 on first run
- [ ] `bash packages/mastery-coach/scripts/link-extension.sh` exits 0 on second run; symlink unchanged; no duplicate entries
- [ ] `git diff main -- packages/agent packages/ai packages/coding-agent packages/tui` produces empty output (zero lines)
- [ ] Manual: `pi` launched from arbitrary dir; menu renders containing the three numbered options in order plus instruction line
- [ ] Manual: invoking `/goal-oriented` produces `Not implemented yet` notification
- [ ] Manual: invoking `/practice-today` produces `Not implemented yet` notification
- [ ] Manual: invoking `/open-practice` produces `Not implemented yet` notification
- [ ] Manual: invoking `/reload` does NOT re-render the menu; the three commands remain available
- [ ] Manual: no GraphDB, no Mochi API key, no `~/.config/mastery-coach/secrets.json` is required to observe all the above

#### Subtasks
- [ ] Run `npm install` and capture exit code
- [ ] Run `npx tsgo --noEmit` and capture exit code
- [ ] Run `npx biome check --write --error-on-warnings .` and capture exit code
- [ ] Run `node scripts/check-ts-relative-imports.mjs` and capture exit code
- [ ] Run `cd packages/mastery-coach && npm test` and capture exit code
- [ ] Run `bash packages/mastery-coach/scripts/link-extension.sh` twice and verify symlink
- [ ] Run `git diff main -- packages/agent packages/ai packages/coding-agent packages/tui` and verify empty
- [ ] Manually launch `pi`, observe menu, invoke each command, run `/reload`
- [ ] Record results in PR / commit message

#### Blockers
- A failing static check from a separate cause (existing repo state) would block the empty-diff assertion. Mitigation: re-baseline against `main` before running.

#### Risks
- Manual TUI observations can be subjective. Mitigation: capture screenshots or terminal logs in the PR description.

#### Complexity
Small (S)

#### Dependencies
ALL prior steps (1-8).

#### Uncertainty Rating
Low

#### Integration Points
- Final go/no-go gate before code review.

#### Definition of Done
- [ ] All static checks pass
- [ ] All tests pass
- [ ] Link script idempotency confirmed
- [ ] Upstream invariant (empty diff) confirmed
- [ ] Manual TUI walkthrough recorded
- [ ] Verification log attached to PR

#### Verification

**Level:** NOT NEEDED
**Rationale:** This step IS the verification gate — the QA agent executes every static check (tsgo, biome, relative-imports), runs the unit test suite, runs the link script twice for idempotency, asserts the upstream-untouched diff, and performs the manual TUI walkthrough. Each Success Criterion has a binary exit-code or visible-observation pass/fail. Meta-verifying the verifier adds no signal: the deliverable is a verification log, not an artifact whose quality can be judged. All upstream verification (Steps 2–8 with judges) already covers the produced artifacts; Step 9 simply executes and records.

---

## Verification Summary

| Step | Verification Level | Judges | Threshold | Artifacts |
|------|--------------------|--------|-----------|-----------|
| 1 | NOT NEEDED | — | — | Directory skeleton (`packages/mastery-coach/` + 9 subdirs + 5 `.gitkeep`) |
| 2 | Single Judge | 1 | 4.0/5.0 | `package.json`, `tsconfig.json` (Pi manifest + workspace + TS config) |
| 3 | Single Judge | 1 | 4.0/5.0 | `src/prompts/main-menu.ts` (MAIN_MENU_TEXT constant) |
| 4 | Per-Command (3 parallel) | 3 | 4.0/5.0 | `src/commands/{goal-oriented,practice-today,open-practice}.ts` (3 stub modules) |
| 5 | CRITICAL — Panel (2) | 2 | 4.0/5.0 | `src/index.ts` (extension factory — integration point) |
| 6 | Single Judge | 1 | 4.0/5.0 | `scripts/link-extension.sh` (idempotent bash symlink) |
| 7 | Single Judge | 1 | 4.0/5.0 | `test/mastery-coach.test.ts` (vitest suite, 4 describe blocks) |
| 8 | Single Judge | 1 | 4.0/5.0 | `README.md` (setup + env-var caveat + downstream layout) |
| 9 | NOT NEEDED | — | — | E2E verification log (Step IS the verifier) |

**Total Evaluations:** 10 (1 + 1 + 3 + 2 + 1 + 1 + 1 = 10)
**Implementation Command:** `/implement $TASK_FILE`

---

## Implementation Summary

| Step | Goal | Output | Est. Effort |
|------|------|--------|-------------|
| 1 | Create directory skeleton + .gitkeeps | 9 dirs + 5 .gitkeep files | S |
| 2 | Add package.json + tsconfig.json | 2 config files + workspace registered | S |
| 3 | Add MAIN_MENU_TEXT constant | `src/prompts/main-menu.ts` | S |
| 4 | Add three command stub modules | 3 files in `src/commands/` | S |
| 5 | Implement extension factory | `src/index.ts` wiring hook + commands | S |
| 6 | Add idempotent symlink script | `scripts/link-extension.sh` (executable) | S |
| 7 | Unit/smoke tests | `test/mastery-coach.test.ts` (vitest) | M |
| 8 | README documentation | `packages/mastery-coach/README.md` | S |
| 9 | End-to-end verification | Verification log in PR | S |

**Total Steps**: 9
**Critical Path**: Steps 1 -> 2 -> 3 -> 4 -> 5 -> 7 -> 9 (7 steps; Steps 6 and 8 are off the critical path)
**Parallel Opportunities**:
- Steps 3, 4, 6 can run concurrently after Step 2 completes
- Step 8 (README) can run concurrently with Step 7 (tests) after Steps 5 + 6 complete
- Within Step 4, the three command file writes are independent

**Total Estimated Effort**: ~1.5 dev-days (8 × S + 1 × M)

---

## Risks & Blockers Summary

### High Priority

| Risk/Blocker | Impact | Likelihood | Mitigation |
|--------------|--------|------------|------------|
| Value (non-type-only) import of `@earendil-works/pi-coding-agent` causes jiti runtime failure | High | Medium | Step 4/5 success criteria explicitly require `import type`; verified by `tsgo --noEmit` + manual review at end of Step 5 |
| `pi.sendUserMessage()` invoked at factory top-level throws "Extension runtime not initialized" | High | Low | Step 5 success criteria explicitly forbid top-level I/O; manual review subtask; Step 7 mock factory invocation would catch any such side effect |
| Symlink script fails because `~/.pi/agent/extensions/` parent dir is missing | High | Medium | Step 6 success criteria require `mkdir -p` before `ln`; manual idempotency test in subtasks |
| Missing `reason` filter in session_start handler re-renders menu on `/reload` | Medium | Low | Step 5 success criteria + Step 7 test case 4 (all 5 reasons asserted) |

### Medium Priority

| Risk/Blocker | Impact | Likelihood | Mitigation |
|--------------|--------|------------|------------|
| biome formatting (tabs, indentWidth 3, lineWidth 120) violated by IDE defaults | Medium | High | Step 9 runs `biome check --write --error-on-warnings .`; commit the auto-formatted result |
| vitest version mismatch with monorepo triggers duplicate installs | Medium | Low | Pin vitest to `3.2.4` in Step 2's package.json (matches `packages/ai/package.json`) |
| Test file accidentally placed in `src/` instead of `test/` breaks tsconfig/biome convention | Medium | Low | Step 7 explicit file path `test/mastery-coach.test.ts`; matches design Decision 4 |

### Low Priority

| Risk/Blocker | Impact | Likelihood | Mitigation |
|--------------|--------|------------|------------|
| README drifts from acceptance scope (claims features that don't exist) | Low | Medium | Step 8 success criteria cross-check against task's `Scope > Excluded` list |
| Lockfile churn from `npm install` causes noisy diff | Low | High | Commit lockfile change as part of Step 2; reviewer notes |
| Env-var discrepancy (`PI_AGENT_DIR` vs `PI_CODING_AGENT_DIR`) confuses power users | Low | Low | Step 8 README explicitly documents both; default flow unaffected |

---

## Definition of Done (Task Level)

- [ ] All 9 implementation steps completed
- [ ] All Functional Requirements acceptance criteria pass (verified in Step 9)
- [ ] All Non-Functional Requirements acceptance criteria pass (verified in Step 9)
- [ ] Tests written and passing (Step 7 vitest suite: 4 describe blocks)
- [ ] Documentation updated (`packages/mastery-coach/README.md` from Step 8)
- [ ] `git diff main -- packages/agent packages/ai packages/coding-agent packages/tui` produces empty output
- [ ] No new biome warnings introduced anywhere in the monorepo
- [ ] No high-priority risks unaddressed
- [ ] Code reviewed and merged

---

## High Complexity/Uncertainty Tasks Requiring Attention

**None.** All 9 steps are sized Small except Step 7 which is Medium (mock construction + 4 describe blocks). No step has high uncertainty: the API surface (`ExtensionAPI`, `SessionStartEvent`, `ExtensionCommandContext`, `ExtensionUIContext.notify`) is fully specified in `packages/coding-agent/src/core/extensions/types.ts`; the loader behaviour is verified in `loader.ts:L440-L600`; the manifest format has a working precedent (`examples/extensions/with-deps/`); the session_start pattern has a working precedent (`examples/extensions/plan-mode/index.ts:L291`).

**Recommendation**: Proceed as-is. No further decomposition needed. No spike tasks required.
