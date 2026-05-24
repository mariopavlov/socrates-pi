/**
 * Stub handler for the `/practice-today` slash command.
 *
 * MVP scaffold: surfaces the literal `Not implemented yet` notification and performs
 * no other side effect. The real Practice Today selector (skill decay scoring,
 * candidate ranking, session lifecycle) lands in a downstream draft task.
 *
 * Import discipline: `ExtensionCommandContext` is imported as `import type`. A value
 * import of `@earendil-works/pi-coding-agent` causes a jiti runtime failure when Pi
 * loads the extension.
 */

import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

export const practiceTodayCommand = {
	name: "practice-today",
	description: "Propose today's practice based on skill decay",
	handler: async (_args: string, ctx: ExtensionCommandContext): Promise<void> => {
		ctx.ui.notify("Not implemented yet", "info");
	},
};
