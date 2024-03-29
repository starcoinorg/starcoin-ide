import * as vscode from 'vscode';
import { Logger } from '../log';
import { IDEExtensionContext } from '../context';
import { parseMoveTestId } from './utils';
import { getTaskResult } from '../utils';

type CollectedTest = { item: vscode.TestItem; explicitlyIncluded?: boolean };

export class MoveTestRunner {
  private readonly ctx: IDEExtensionContext;
  private readonly logger: Logger;
  private readonly ctrl: vscode.TestController;

  constructor(ctx: IDEExtensionContext, ctrl: vscode.TestController) {
    this.ctx = ctx;
    this.logger = ctx.logger;
    this.ctrl = ctrl;

    ctrl.createRunProfile(
      'Move',
      vscode.TestRunProfileKind.Run,
      async (request, token) => {
        try {
          await this.run(request, token);
        } catch (error) {
          const m = 'Failed to execute tests';
          ctx.logger.info(`${m}: ${error}`);
          await vscode.window.showErrorMessage(m);
        }
      },
      true
    );
  }

  // Execute tests - TestController.runTest callback
  async run(request: vscode.TestRunRequest, token?: vscode.CancellationToken): Promise<boolean> {
    this.logger.info('Running tests...');

    const collected = new Set<CollectedTest>();
    this.collectTests(request, collected);

    const run = this.ctrl.createTestRun(request);

    for (const test of collected) {
      const item = test.item;
      const moveTest = parseMoveTestId(item.id);

      run.started(item);
      if (moveTest.name === undefined) {
        throw new Error('moveTest name error!');
      }
      const tokens = moveTest.name.split('::');
      let testFunc = moveTest.name;
      if (tokens.length > 0) {
        testFunc = tokens[tokens.length - 1];
      }

      const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.testFunction', testFunc);
      const exitCode = await getTaskResult(exec);
      if (exitCode !== 0) {
        this.logger.info(`Test ${moveTest.name} failed`);
        item.error = `Test ${moveTest.name} failed`;
        run.failed(item, { message: 'Test failed!' });
      } else {
        run.passed(item);
      }

      if (token?.isCancellationRequested) {
        break;
      }
    }

    run.end();

    return true;
  }

  // Collect tests
  collectTests(request: vscode.TestRunRequest, collected: Set<CollectedTest>) {
    if (request.include !== undefined) {
      for (const item of request.include) {
        this.collectItem(item, collected);
      }
    }
  }

  // Collect item recursion
  collectItem(item: vscode.TestItem, collected: Set<CollectedTest>) {
    const moveTest = parseMoveTestId(item.id);

    if (moveTest.kind === 'func') {
      collected.add({ item: item, explicitlyIncluded: true });
    } else {
      item.children.forEach((child) => {
        this.collectItem(child, collected);
      });
    }
  }
}
