/**
 * Entry Point for the StarCoin IDE Extension.
 * 
 * @copyright 2021 StarCoin
 */

import * as Path from 'path';
import * as vscode from 'vscode';
import { dos2unix, fixMoveFiles } from './utils'
import { Downloader, MoveDownloader, MPMDownloader, Release, currentDownloader } from './downloader';
    
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
    const loader:Downloader = currentDownloader(context.extensionPath);

    // Check for the binary every time extension is activated. Either install latest
    // version if binary is not found or fetch for newer version. If it is found, then
    // pull and install it.
    if (!loader.hasBinary()) {
        vscode.window.showWarningMessage('No ' + loader.executateDesc + ' found. Fetching latest version...');
        
        let {tag, release} = await loader.checkRelease(loader.latestVersion);

        try {
            await installReleaseWithProgress(loader, tag, release);
            vscode.window.showInformationMessage(loader.executateDesc + ' ' + tag + ' installed!');
        } catch(err:any) {
            vscode.window.showErrorMessage(loader.executateDesc + ' ' + tag + ' install failed, error: ' + err);
            return
        }
    } else {
        let {tag, release} = await loader.checkRelease(loader.latestVersion);

        if (loader.isBinaryOutdated(tag)) {
            vscode.window.showInformationMessage('Newer ' + loader.executateDesc + ' found: ' + tag + '; Pulling...');
            
            try {
                await installReleaseWithProgress(loader, tag, release);
                vscode.window.showInformationMessage(loader.executateDesc + ' updated!');
            } catch(err:any) {
                vscode.window.showErrorMessage(loader.executateDesc + ' update failed, error: ', err);
            }
        }
    }

    context.subscriptions.push(
        registerCommand('starcoin.reloadExtension', () => reloadExtensionCommand(context)),
    );

    if (loader instanceof MoveDownloader) {
        context.subscriptions.push(
            registerCommand('starcoin.check', checkCommand),
            registerCommand('starcoin.clean', cleanCommand),
            registerCommand('starcoin.doctor', doctorCommand),
            registerCommand('starcoin.testUnit', testUnitCommand),
            registerCommand('starcoin.testFunctional', testFunctionalCommand),
            registerCommand('starcoin.run', runCommand),
            registerCommand('starcoin.publish', publishCommand),
            registerCommand('starcoin.release', releaseCommand)
        );
    } else if (loader instanceof MPMDownloader) {
        context.subscriptions.push(
            registerCommand('starcoin.check', mpmCheckCommand),
            registerCommand('starcoin.clean', mpmCleanCommand),
            registerCommand('starcoin.doctor', mpmDoctorCommand),
            registerCommand('starcoin.testUnit', mpmTestUnitCommand),
            registerCommand('starcoin.testFunctional', mpmTestFunctionalCommand),
            registerCommand('starcoin.run', mpmRunCommand),
            registerCommand('starcoin.publish', mpmPublishCommand),
            registerCommand('starcoin.release', mpmReleaseCommand)
        );
    }
}

export function deactivate(context: vscode.ExtensionContext): void {}


/**
 * Install release with progress
 * 
 * @param loader 
 * @param version 
 * @param release 
 * @returns 
 */
 export function installReleaseWithProgress(loader: Downloader, version: string, release: Release) :Thenable<void> {
    let lastVal: number = 0

    return vscode.window.withProgress<void>({
        location: vscode.ProgressLocation.Window,
        title: "Downloading " + loader.executateDesc + " " + version,
        cancellable: false
    }, (progress) => {
        return loader.installRelease(version, release, function(val:number){
            let offset = val - lastVal
            lastVal = val

            progress.report({ increment: offset * 100, message: "Progress: " +  (val*100).toFixed(2) + "%" });
        });
    })
}

/**
 * Reload current extension
 */
 async function reloadExtensionCommand(context: vscode.ExtensionContext): Promise<void> {
    await deactivate(context);

	for (const sub of context.subscriptions) {
		try {
			sub.dispose();
		} catch (e) {
			console.error(e);
		}
	}
    
	await activate(context);
}

/**
 * Path to use when executing command.
 * Can be either this file, or workdir,
 * or source files (src/) or None (no path used).
 */
enum Marker {
    ThisFile,
    WorkDir,
    SrcDir,
    StdLibDir,
    None
}

// Block of function definitions for each command of the extension. All these functions use the 
// same interface execute(), so see it below for the details.

// move commands
function checkCommand(): Thenable<any> { 
    let exec = moveExecute('check', 'check', Marker.SrcDir); 

    return new Promise((resolve) => {
        exec.then(async function(taskExec){
            await fixMoveFiles(taskExec)
            resolve(taskExec)
        })
    });
}

function cleanCommand(): Thenable<any> { return moveExecute('clean', 'clean', Marker.None);}
function doctorCommand(): Thenable<any> { return moveExecute('doctor', 'doctor', Marker.None); }
function testFunctionalCommand(): Thenable<any> { return moveExecute('testFunctional', 'functional-test', Marker.ThisFile); }
function publishCommand(): Thenable<any> { return moveExecute('publish', 'publish', Marker.ThisFile); }
function runCommand(): Thenable<any> { return moveExecute('run', 'run', Marker.ThisFile); }
function testUnitCommand(): Thenable<any> { return moveExecute('testUnit', 'unit-test', Marker.ThisFile); }
function releaseCommand(): Thenable<any> { 
    vscode.window.showInformationMessage('move cli not support release command')
    return new Promise((resolve) => {
        resolve(false)
    });
}

// mpm commands
function mpmCheckCommand(): Thenable<any> { return mpmExecute('check', 'check-compatibility', Marker.None); }
function mpmCleanCommand(): Thenable<any> { return mpmExecute('clean', 'sandbox clean', Marker.None); }
function mpmDoctorCommand(): Thenable<any> { return mpmExecute('doctor', 'sandbox doctor', Marker.None); }
function mpmTestUnitCommand(): Thenable<any> { return mpmExecute('testUnit', 'package test', Marker.None); }
function mpmTestFunctionalCommand(): Thenable<any> { return mpmExecute('testFunctional', 'spectest', Marker.None); }
function mpmRunCommand(): Thenable<any> { return mpmExecute('run', 'sandbox run', Marker.ThisFile); }
function mpmPublishCommand(): Thenable<any> { return mpmExecute('publish', 'sandbox publish', Marker.None); }
function mpmReleaseCommand(): Thenable<any> { return mpmExecute('release', 'release', Marker.None); }

/**
 * Main function of this extension. Runs the given move command as a VSCode task,
 * optionally include the current file as an argument for the binary.
 * 
 * @param task 
 * @param command 
 * @param useFile 
 * @returns 
 */
function moveExecute(task: string, command: string, fileMarker: Marker): Thenable<any> {
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
    const dir = workdir.uri.fsPath;
    
    // @ts-ignore
    const commonArgs: string[] = [
        ['--storage-dir', Path.join(dir, 'storage')],
        ['--build-dir', Path.join(dir, 'build')],
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
        case Marker.SrcDir: path = Path.join(dir, 'sources'); break;
        case Marker.StdLibDir: path = Path.join(dir, 'build/package/starcoin/source_files'); break;
    }
    
    // Fix file format in windows
    if (process.platform === 'win32') {
        dos2unix(path, "**/*.move")
    }

    return tasks.executeTask(new Task(
        {task, type: NAMESPACE},
        workdir,
        task,
        NAMESPACE,
        new ShellExecution([bin, command, path, commonArgs.join(' ')].join(' '))
    ));
}

/**
 * Main function of this extension. Runs the given mpm command as a VSCode task,
 * optionally include the current file as an argument for the binary.
 * 
 * @param task 
 * @param command 
 * @param useFile 
 * @returns 
 */
function mpmExecute(task: string, command: string, fileMarker: Marker): Thenable<any> {
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
    const dir = workdir.uri.fsPath;
    
    // @ts-ignore
    const commonArgs: string[] = [
        ['--path', Path.join(dir, configuration.get<string>('storageDirectory') || '.')],
        ['--install-dir', Path.join(dir, configuration.get<string>('buildDirectory') || '.')],
    ]
        .filter((a) => (a[1] !== null))
        .map((param) => param.join(' '));

    // Get binary path which is always inside `extension/bin` directory.
    const bin = Path.join(extPath, 'bin', (process.platform === 'win32') ? 'mpm.exe' : 'mpm');
    
    // Set path using the passed Marker. Each binary command has  
    // its own requirements for the path to pass into it. 
    let path = '';
    switch (fileMarker) {
        case Marker.None: path = ''; break;
        case Marker.ThisFile: path = document.uri.fsPath.toString() || ''; break;
        case Marker.WorkDir: path = dir; break;
        case Marker.SrcDir: path = Path.join(dir, 'sources'); break;
    }
    
    return tasks.executeTask(new Task(
        {task, type: NAMESPACE},
        workdir,
        task,
        NAMESPACE,
        new ShellExecution([bin, command, path, commonArgs.join(' ')].join(' '))
    ));
}
