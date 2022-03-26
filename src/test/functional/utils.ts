
import * as vscode from 'vscode';

export function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function getTaskResult(taskExecution: vscode.TaskExecution): Promise<number|undefined> {
    let disposables = new Array<vscode.Disposable>()
    let disposeAll = function(){
        for(let i=0; i<disposables.length; i++) {
            disposables[i].dispose()
        }
    }

    return new Promise<number|undefined>(resolve => {
        disposables.push(vscode.tasks.onDidEndTask(e => {
            if (e.execution == taskExecution) {
                disposeAll();
                resolve(0);
            }
        }));

        disposables.push(vscode.tasks.onDidEndTaskProcess(e => {
            if (e.execution == taskExecution) {
                disposeAll();
                resolve(e.exitCode);
            }
        }));
    });
}

export function dos2unix(rootDir:string, grep:string) {
    const globArray = require('glob-array');
    const fs = require('fs');
    const path = require('path');

    const files = globArray.sync([grep], {
        cwd: path.resolve(rootDir)
    });

    files.map((file:any) => {
        const f = path.join(rootDir, file)
        const content = fs.readFileSync(f, 'utf8');
        fs.writeFileSync(f, Buffer.from(content.replace(/\r\n/g, '\n'), 'utf8'));
    });
}

export async function executeStarcoinCheckCommandWithFixed(): Promise<void> {
    let disposables = new Array<vscode.Disposable>()
    let disposeAll = function(){
        for(let i=0; i<disposables.length; i++) {
            disposables[i].dispose()
        }
    }

    let fixMoves = function(task:vscode.Task){
        let workspaceFolder = (task.scope as vscode.WorkspaceFolder).uri.fsPath
        dos2unix(workspaceFolder, "**/*.move")
    }

    let taskExecution:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.check");
    return new Promise<void>(resolve => {
        disposables.push(vscode.tasks.onDidEndTask(e => {
            if (e.execution == taskExecution) {
                fixMoves(e.execution.task)

                disposeAll();
                resolve();
            }
        }));

        disposables.push(vscode.tasks.onDidEndTaskProcess(e => {
            if (e.execution == taskExecution) {
                fixMoves(e.execution.task)

                disposeAll();
                resolve();
            }
        }));
    });
}