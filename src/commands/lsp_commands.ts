import * as vscode from 'vscode';
import * as lc from 'vscode-languageclient';

import { CommandFactory } from '.';
import { IDEExtensionContext } from '../context';

/**
 * startLanguageServer
 */
export const startLanguageServer: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (): Promise<void> => {
    const logger = ctx.logger;

    const executable: lc.Executable = {
      command: ctx.moveAnalyzerBin || 'move-analyzer'
    };
    const serverOptions: lc.ServerOptions = {
      run: executable,
      debug: executable
    };

    // The vscode-languageclient module reads a configuration option named
    // "<extension-name>.trace.server" to determine whether to log messages. If a trace output
    // channel is specified, these messages are printed there, otherwise they appear in the
    // output channel that it automatically created by the `LanguageClient` (in this extension,
    // that is 'Move Language Server'). For more information, see:
    // https://code.visualstudio.com/api/language-extensions/language-server-extension-guide#logging-support-for-language-server
    const traceOutputChannel = vscode.window.createOutputChannel('Move Analyzer Language Server Trace');
    const clientOptions: lc.LanguageClientOptions = {
      documentSelector: [{ scheme: 'file', language: 'move' }],
      traceOutputChannel
    };

    const client = new lc.LanguageClient('move-analyzer', 'Move Language Server', serverOptions, clientOptions);
    logger.info('Starting client...');
    const disposable = client.start();
    ctx.vscode.subscriptions.push(disposable);
    ctx.languageClient = client;

    // Wait for the Move Language Server initialization to complete,
    // especially the first symbol table parsing is completed
    await client.onReady();
  };
};
