/**
 * Entry Point for the StarCoin IDE Extension.
 * 
 * @copyright 2021 StarCoin
 */

import * as Path from 'path';
import * as vscode from 'vscode';
import { Downloader } from './downloader';
    
const {commands, window, tasks, Task, ShellExecution} = vscode;
const {registerCommand} = commands;

/**
 * Name of the namespace to shorten all access points
 * and lessen amount of magic in string names.
 */
const NAMESPACE = 'starcoin';

/**
 * Name of the extension to get context.
 */
const EXTENSION = 'starcoinorg.starcoin-ide';


export async function activate(context: vscode.ExtensionContext): Promise<void> {

    const loader = new Downloader(context.extensionPath);

    // Check for the binary every time extension is activated. Either install latest
    // version if binary is not found or fetch for newer version. If it is found, then
    // pull and install it.
    if (!loader.hasBinary()) {
        vscode.window.showWarningMessage('No binary found. Fetching latest version...');
        
        let {latest, release} = await loader.checkNewRelease();
        await loader.installRelease(latest, release);
        vscode.window.showInformationMessage('Move binary ' + latest + ' installed!');
    } else {
        let {latest, release} = await loader.checkNewRelease();
        if (loader.isBinaryOutdated(latest)) {
            vscode.window.showInformationMessage('Newer binary found: ' + latest + '; Pulling...');

            await loader.installRelease(latest, release);
            vscode.window.showInformationMessage('Move binary updated!');
        }
    }

    context.subscriptions.push(
        registerCommand('starcoin.check', () => checkCommand().then(console.log)),
        registerCommand('starcoin.clean', () => cleanCommand().then(console.log)),
        registerCommand('starcoin.doctor', () => doctorCommand().then(console.log)),
        registerCommand('starcoin.testFunctional', () => testFunctionalCommand().then(console.log)),
        registerCommand('starcoin.publish', () => publishCommand().then(console.log)),
        registerCommand('starcoin.run', () => runCommand().then(console.log)),
        registerCommand('starcoin.testUnit', () => testUnitCommand().then(console.log)),
        registerCommand('starcoin.publishAll', () => publishAllCommand().then(console.log)),
        registerCommand('starcoin.view', () => viewCommand().then(console.log)),
    );
}

export function deactivate(context: vscode.ExtensionContext): void {}

/**
 * Path to use when executing command.
 * Can be either this file, or workdir,
 * or source files (src/) or None (no path used).
 */
enum Marker {
    ThisFile,
    WorkDir,
    SrcDir,
    None
}

// Block of function definitions for each command of the extension. All these functions use the 
// same interface execute(), so see it below for the details.

function checkCommand(): Thenable<any> { return execute('check', 'check', Marker.None); }
function cleanCommand(): Thenable<any> { return execute('clean', 'clean', Marker.ThisFile); }
function doctorCommand(): Thenable<any> { return execute('doctor', 'doctor', Marker.None); }
function testFunctionalCommand(): Thenable<any> { return execute('testFunctional', 'functional-test', Marker.ThisFile); }
function publishCommand(): Thenable<any> { return execute('publish', 'publish', Marker.ThisFile); }
function runCommand(): Thenable<any> { return execute('run', 'run', Marker.ThisFile); }
function testUnitCommand(): Thenable<any> { return execute('testUnit', 'unit-test', Marker.ThisFile); }
function publishAllCommand(): Thenable<any> { return execute('publishAll', 'publish', Marker.SrcDir); }
function viewCommand(): Thenable<any> { return execute('view', 'view', Marker.ThisFile); }


/**
 * Main function of this extension. Runs the given command as a VSCode task,
 * optionally include the current file as an argument for the binary.
 * 
 * @param task 
 * @param command 
 * @param useFile 
 * @returns 
 */
function execute(task: string, command: string, fileMarker: Marker): Thenable<any> {

    const document = window.activeTextEditor?.document;
    const extPath  = vscode.extensions.getExtension(EXTENSION)?.extensionPath;

    if (!extPath) {
        return Promise.reject('Unable to find the extension');
    }

    if (!document) {
        return Promise.reject('No document opened');
    }

    const workdir = vscode.workspace.getWorkspaceFolder(document.uri);
    const configuration = vscode.workspace.getConfiguration(NAMESPACE, document.uri);

    if (!workdir || !configuration) {
        return Promise.reject('Unable to read workspace folder');
    }

    // Current working (project) directory to set absolute paths.
    const dir = workdir.uri.path;
    
    // @ts-ignore
    const commonArgs: string[] = [
        ['--storage-dir', Path.join(dir, configuration.get<string>('storageDirectory') || 'storage')],
        ['--build-dir', Path.join(dir, configuration.get<string>('buildDirectory') || 'build')],
        ['--starcoin-rpc', configuration.get<string>('starcoinRPC') || null],
        ['--mode', configuration.get<string>('mode') || null],
    ]
        .filter((a) => (a[1] !== null))
        .map((param) => param.join(' '));

    // Get binary path which is always inside `extension/bin` directory.
    const bin = Path.join(extPath, 'bin', (process.platform === 'win32') ? 'move.exe' : 'move');
    
    // Set path using the passed Marker. Each binary command has  
    // its own requirements for the path to pass into it. 
    let path = '';
    switch (fileMarker) {
        case Marker.None: path = ''; break;
        case Marker.ThisFile: path = document.uri.fsPath.toString() || ''; break;
        case Marker.WorkDir: path = dir; break;
        case Marker.SrcDir: path = Path.join(dir, 'src');
    }
    
    return tasks.executeTask(new Task(
        {task, type: NAMESPACE},
        workdir,
        task,
        NAMESPACE,
        new ShellExecution([bin, command, path, commonArgs.join(' ')].join(' '))
    ));
}
