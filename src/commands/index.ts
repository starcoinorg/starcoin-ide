import * as vscode from 'vscode';
import { IDEExtensionContext } from '../context';

export { reloadExtension } from './reload_extension';
export { checkAndUpdateAll } from './update_tools';
export { startLanguageServer } from './lsp_commands';
export * from './mpm_commands';

type CommandCallback<T extends unknown[]> = (...args: T) => Promise<unknown> | unknown;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandFactory<T extends unknown[] = any[]> = (ideCtx: IDEExtensionContext) => CommandCallback<T>;

export function createRegisterCommand(ctx: IDEExtensionContext) {
  return function registerCommand(name: string, fn: CommandFactory) {
    ctx.vscode.subscriptions.push(vscode.commands.registerCommand(name, fn(ctx)));
  };
}
