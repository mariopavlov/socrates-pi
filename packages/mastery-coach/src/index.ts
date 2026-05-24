/**
 * Mastery Coach — Pi Extension Factory
 *
 * Entry point declared by `package.json` `pi.extensions[0]`. Pi's loader
 * (`packages/coding-agent/src/core/extensions/loader.ts`) imports this file via
 * jiti at runtime and invokes the default export with an `ExtensionAPI` instance.
 *
 * MVP scope (see `.specs/tasks/in-progress/mvp-scaffold-and-stub-menu.feature.md`):
 *   - Register exactly one `session_start` listener that renders the main menu
 *     only when `event.reason` is `"startup"` or `"new"` (so `/reload`, resume,
 *     and fork do NOT re-render).
 *   - Register exactly three slash commands (`/goal-oriented`, `/practice-today`,
 *     `/open-practice`); each surfaces "Not implemented yet" today.
 *   - Perform NO I/O at module top-level — the factory is pure registration.
 *   - Do NOT register tools, message renderers, or any other lifecycle hooks
 *     in this MVP; those land in downstream feature tasks.
 *
 * Import discipline: `ExtensionAPI` is imported with `import type`. A value
 * import of `@earendil-works/pi-coding-agent` causes a jiti runtime failure
 * when Pi loads the extension.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { goalOrientedCommand } from "./commands/goal-oriented.ts";
import { openPracticeCommand } from "./commands/open-practice.ts";
import { practiceTodayCommand } from "./commands/practice-today.ts";
import { MAIN_MENU_TEXT } from "./prompts/main-menu.ts";

export default function masteryCoachExtension(pi: ExtensionAPI): void {
	pi.on("session_start", (event) => {
		// Render the menu only on fresh sessions. `reload`, `resume`, and `fork`
		// are intentionally ignored so the menu does not re-appear mid-conversation.
		if (event.reason === "startup" || event.reason === "new") {
			pi.sendUserMessage(MAIN_MENU_TEXT);
		}
	});

	pi.registerCommand(goalOrientedCommand.name, {
		description: goalOrientedCommand.description,
		handler: goalOrientedCommand.handler,
	});

	pi.registerCommand(practiceTodayCommand.name, {
		description: practiceTodayCommand.description,
		handler: practiceTodayCommand.handler,
	});

	pi.registerCommand(openPracticeCommand.name, {
		description: openPracticeCommand.description,
		handler: openPracticeCommand.handler,
	});
}
