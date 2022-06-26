import { CommandFactory } from '.';
import { IDEExtensionContext } from '../context';

/**
 * Reload current extension
 */
export const reloadExtension: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (): Promise<void> => {
    await ctx.deactivate(ctx.vscode);

    for (const sub of ctx.vscode.subscriptions) {
      try {
        sub.dispose();
      } catch (e) {
        console.error(e);
      }
    }

    await ctx.activate(ctx.vscode);
  };
};
