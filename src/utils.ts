import * as vscode from 'vscode';

export function dos2unix(rootDir: string, grep: string) {
  const globArray = require('glob-array');
  const fs = require('fs');
  const path = require('path');

  const files = globArray.sync([grep], {
    cwd: path.resolve(rootDir)
  });

  files.map((file: any) => {
    const f = path.join(rootDir, file);
    const content = fs.readFileSync(f, 'latin1');
    fs.writeFileSync(f, Buffer.from(content.replace(/\r\n/g, '\n'), 'latin1'));
  });
}

export function getTaskResult(taskExecution: vscode.TaskExecution): Promise<number | undefined> {
  const disposables = new Array<vscode.Disposable>();
  const disposeAll = function () {
    for (let i = 0; i < disposables.length; i++) {
      disposables[i].dispose();
    }
  };

  return new Promise<number | undefined>((resolve) => {
    disposables.push(
      vscode.tasks.onDidEndTask((e) => {
        if (e.execution === taskExecution) {
          disposeAll();
          resolve(0);
        }
      })
    );

    disposables.push(
      vscode.tasks.onDidEndTaskProcess((e) => {
        if (e.execution === taskExecution) {
          disposeAll();
          resolve(e.exitCode);
        }
      })
    );
  });
}

export function getWorkspaceDir(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return '';
  }

  return workspaceFolders[0].uri.fsPath;
}
