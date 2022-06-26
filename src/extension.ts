/**
 * Entry Point for the StarCoin IDE Extension.
 *
 * @copyright 2021 StarCoin
 */
import * as vscode from 'vscode';

import { IDEExtensionContext } from './context';
import { Logger } from './log';
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
        namespace: NAMESPACE,
        extension: EXTENSION,
        vscode: ctx,
        logger: new Logger(),
        activate,
        deactivate,
    };

    const registerCommand = commands.createRegisterCommand(ideCtx);

    registerCommand('starcoin.reloadExtension', commands.reloadExtension);
    registerCommand('starcoin.checkAndUpdateAll', commands.checkAndUpdateAll);

    await commands.checkAndUpdateAll(ideCtx)();
    await commands.startLanguageServer(ideCtx)();

    registerCommand('starcoin.build', commands.mpmBuild);
    registerCommand('starcoin.testUnit', commands.mpmTestUnit);
    registerCommand('starcoin.testIntegration', commands.mpmTestIntegration);
    registerCommand('starcoin.testFile', commands.mpmTestFile);
    registerCommand('starcoin.publish', commands.mpmPublish);
    registerCommand('starcoin.doctor', commands.mpmDoctor);
    registerCommand('starcoin.checkCompatibility', commands.mpmCheckCompatibility);
    registerCommand('starcoin.release', commands.mpmRelease);
    registerCommand('starcoin.clean', commands.mpmClean);
}

export function deactivate(context: vscode.ExtensionContext): void { }
