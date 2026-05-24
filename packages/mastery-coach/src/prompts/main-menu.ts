/**
 * Mastery Coach — Main Menu Prompt
 *
 * Static, immutable text rendered to the apprentice by the `session_start` hook
 * (see `../index.ts`) when a fresh session begins.
 *
 * Contract (from `.specs/tasks/in-progress/mvp-scaffold-and-stub-menu.feature.md`,
 * acceptance criterion "Main menu renders at startup and on new sessions only"):
 *
 *   "A user-side message is sent (via `pi.sendUserMessage`) containing a Mastery
 *    Coach header, the three options exactly as `1. Goal-oriented`,
 *    `2. Practice Today`, `3. Open Practice` in this order, and a one-line
 *    instruction directing the apprentice to invoke the corresponding slash
 *    command for the chosen option."
 *
 * This module performs no I/O and has no side effects on load. The constant is
 * a plain string with no interpolation — safe to import from any context.
 */

export const MAIN_MENU_TEXT: string = [
	"Mastery Coach",
	"",
	"Pick how you want to practice today:",
	"",
	"1. Goal-oriented   — work toward a specific goal you have set.",
	"2. Practice Today  — review the skills the coach suggests are due.",
	"3. Open Practice   — explore freely without a fixed plan.",
	"",
	"Invoke /goal-oriented, /practice-today, or /open-practice for your chosen option.",
].join("\n");
