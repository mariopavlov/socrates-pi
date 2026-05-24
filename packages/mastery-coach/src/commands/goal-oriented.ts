import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

/**
 * Stub handler for the `/goal-oriented` slash command.
 *
 * MVP scaffold only: surfaces "Not implemented yet" via `ctx.ui.notify` and
 * performs no other action. The real goal-oriented coaching flow is delivered
 * by a downstream feature task.
 */
export const goalOrientedCommand = {
	name: "goal-oriented",
	description: "Start a goal-oriented coaching session",
	handler: async (_args: string, ctx: ExtensionCommandContext): Promise<void> => {
		ctx.ui.notify("Not implemented yet", "info");
	},
};
