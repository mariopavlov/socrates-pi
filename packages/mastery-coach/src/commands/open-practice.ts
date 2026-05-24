import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

/**
 * Stub handler for the `/open-practice` slash command.
 *
 * MVP behaviour: surfaces the literal string "Not implemented yet" to the apprentice
 * via `ctx.ui.notify` and performs no other action. The real open-ended practice
 * session is implemented by a downstream feature task.
 *
 * Note: the import above is type-only — a value import of `@earendil-works/pi-coding-agent`
 * causes jiti runtime failure when Pi loads the extension.
 */
export const openPracticeCommand = {
	name: "open-practice",
	description: "Open-ended practice session",
	handler: async (_args: string, ctx: ExtensionCommandContext): Promise<void> => {
		ctx.ui.notify("Not implemented yet", "info");
	},
};
