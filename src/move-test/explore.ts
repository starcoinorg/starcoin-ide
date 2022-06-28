import * as vscode from 'vscode';
import { IDEExtensionContext } from '../context';
import { MoveTestResolver } from './resolve';
import { isInTest } from './utils';
import { Logger } from '../log';

// Set true only if the Testing API is available (VSCode version >= 1.59).
export const isVscodeTestingAPIAvailable =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'object' === typeof (vscode as any).tests && 'function' === typeof (vscode as any).tests.createTestController;

export class MoveTestExplorer {
  static setup(ctx: IDEExtensionContext): MoveTestExplorer {
    if (!isVscodeTestingAPIAvailable) throw new Error('VSCode Testing API is unavailable');

    const ctrl = vscode.tests.createTestController('move', 'Move Test Explorer');
    const inst = new this(ctx, ctrl);

    // Process already open editors
    vscode.window.visibleTextEditors.forEach((ed) => {
      inst.documentUpdate(ed.document);
    });

    ctx.vscode.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument(async (x) => {
        try {
          await inst.didOpenTextDocument(x);
        } catch (error) {
          if (isInTest()) throw error;
          else ctx.logger.info(`Failed while handling 'onDidOpenTextDocument': ${error}`);
        }
      })
    );

    ctx.vscode.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(async (x) => {
        try {
          await inst.didChangeTextDocument(x);
        } catch (error) {
          if (isInTest()) throw error;
          else ctx.logger.info(`Failed while handling 'onDidChangeTextDocument': ${error}`);
        }
      })
    );

    ctx.vscode.subscriptions.push(ctrl);

    return inst;
  }

  public readonly resolver: MoveTestResolver;
  private readonly ctx: IDEExtensionContext;
  private readonly logger: Logger;

  private constructor(ctx: IDEExtensionContext, ctrl: vscode.TestController) {
    this.resolver = new MoveTestResolver(ctx, ctrl);
    this.logger = ctx.logger;
  }

  /* ***** Private ***** */

  // Handle opened documents, document changes, and file creation.
  private async documentUpdate(doc: vscode.TextDocument, ranges?: vscode.Range[]) {
    if (!doc.uri.path.endsWith('.move')) {
      return;
    }

    this.logger.info(`documentUpdate Processing ${doc.uri.fsPath}`);

    // If we don't do this, then we attempt to resolve tests in virtual
    // documents such as those created by the Git, GitLens, and GitHub PR
    // extensions
    if (doc.uri.scheme !== 'file') {
      return;
    }

    await this.resolver.processDocument(doc, ranges);
    this.resolver.updateGoTestContext();
  }

  /* ***** Listeners ***** */

  protected async didOpenTextDocument(doc: vscode.TextDocument) {
    await this.documentUpdate(doc);
  }

  protected async didChangeTextDocument(e: vscode.TextDocumentChangeEvent) {
    await this.documentUpdate(
      e.document,
      e.contentChanges.map((x) => x.range)
    );
  }
}
