import * as vscode from 'vscode';
import * as lc from 'vscode-languageclient';
import { Logger } from './log';
import { Config } from './config/config';

// Global variables used for management of the language client.
// They are global so that the server can be easily restarted with
// new configurations.
export interface IDEExtensionContext {
  vscode: vscode.ExtensionContext;
  activate: (context: vscode.ExtensionContext) => void;
  deactivate: (context: vscode.ExtensionContext) => void;

  namespace: string;
  extension: string;
  logger: Logger;
  config: Config;
  mpmBin?: string;
  moveAnalyzerBin?: string;
  languageClient?: lc.LanguageClient;
}
