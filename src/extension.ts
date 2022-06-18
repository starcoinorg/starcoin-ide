/**
 * Entry Point for the StarCoin IDE Extension.
 *
 * @copyright 2021 StarCoin
 */
import * as vscode from 'vscode';

import { IDEExtensionContext } from './context';
import { checkAndUpdateAll } from './updater';
import * as commands from './commands';

/**
 * Name of the namespace to shorten all access points
 * and lessen amount of magic in string names.
 */
const NAMESPACE = 'starcoin';

/**
 * Name of the extension to get context.
 */
const EXTENSION = 'starcoinorg.starcoin-ide';

export async function activate(ctx: vscode.ExtensionContext): Promise<void> {
  const ideCtx: IDEExtensionContext = {
    vscode: ctx,
    activate,
    deactivate,
    namespace: NAMESPACE,
    extension: EXTENSION
  };

  const registerCommand = commands.createRegisterCommand(ideCtx);

  registerCommand('starcoin.reloadExtension', commands.reloadExtension);
  registerCommand('starcoin.build', commands.mpmBuild),
    registerCommand('starcoin.testUnit', commands.mpmTestUnit),
    registerCommand('starcoin.testIntegration', commands.mpmTestIntegration),
    registerCommand('starcoin.testFile', commands.mpmTestFile),
    registerCommand('starcoin.publish', commands.mpmPublish),
    registerCommand('starcoin.doctor', commands.mpmDoctor),
    registerCommand('starcoin.checkCompatibility', commands.mpmCheckCompatibility),
    registerCommand('starcoin.release', commands.mpmRelease),
    registerCommand('starcoin.clean', commands.mpmClean),
    await checkAndUpdateAll(ctx);
}

export function deactivate(context: vscode.ExtensionContext): void {}
