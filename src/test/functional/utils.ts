import * as vscode from 'vscode';

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getTaskResult(taskExecution: vscode.TaskExecution): Promise<number | undefined> {
  let disposables = new Array<vscode.Disposable>();
  let disposeAll = function () {
    for (let i = 0; i < disposables.length; i++) {
      disposables[i].dispose();
    }
  };

  return new Promise<number | undefined>((resolve) => {
    disposables.push(
      vscode.tasks.onDidEndTask((e) => {
        if (e.execution == taskExecution) {
          disposeAll();
          resolve(0);
        }
      })
    );

    disposables.push(
      vscode.tasks.onDidEndTaskProcess((e) => {
        if (e.execution == taskExecution) {
          disposeAll();
          resolve(e.exitCode);
        }
      })
    );
  });
}
