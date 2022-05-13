/**
 * Entry Point for the StarCoin IDE Extension.
 * 
 * @copyright 2021 StarCoin
 */
import * as os from 'os';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as Path from 'path';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import { dos2unix } from './utils'
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
    None
}

// Block of function definitions for each command of the extension. All these functions use the 
// same interface execute(), so see it below for the details.

// move commands
function checkCommand(): Thenable<any> {return moveExecute('check', 'check', Marker.SrcDir)}
function cleanCommand(): Thenable<any> { return moveExecute('clean', 'clean', Marker.None);}
function doctorCommand(): Thenable<any> { return moveExecute('doctor', 'doctor', Marker.None); }
function testFunctionalCommand(): Thenable<any> { return moveExecute('testFunctional', 'functional-test', Marker.ThisFile); }
function publishCommand(): Thenable<any> { return moveExecute('publish', 'publish', Marker.ThisFile); }
function runCommand(): Thenable<any> { return moveExecute('run', 'run', Marker.ThisFile); }
function testUnitCommand(): Thenable<any> { return moveExecute('testUnit', 'unit-test', Marker.ThisFile); }
function releaseCommand(): Thenable<any> { return moveExecute('testUnit', 'publish', Marker.SrcDir); }

// mpm commands
function mpmCheckCommand(): Thenable<any> { return mpmExecute('check', 'check-compatibility', Marker.None); }
function mpmCleanCommand(): Thenable<any> { 
    // clean release dir
    const workDir = getWorkdirPath()
    let releaseDir = Path.join(workDir, "release")
    if (fs.existsSync(releaseDir)) {
        fse.rmdirSync(releaseDir, {
            recursive: true
        })
    }

    return mpmExecute('clean', 'sandbox clean', Marker.None); 
}
function mpmDoctorCommand(): Thenable<any> { return mpmExecute('doctor', 'sandbox doctor', Marker.None); }
function mpmTestUnitCommand(): Thenable<any> { return mpmExecute('testUnit', 'package test', Marker.None); }
function mpmTestFunctionalCommand(): Thenable<any> { return mpmExecute('testFunctional', 'integration-test', Marker.None); }
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

    const configuration = vscode.workspace.getConfiguration(NAMESPACE, document.uri);
    if (!configuration) {
        return Promise.reject('Unable to read configuration folder');
    }

    const workdir = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workdir) {
        return Promise.reject('Unable to read workdir folder');
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
    }
    
    // Fix file format in windows
    if (process.platform === 'win32') {
        let sourceDir = Path.join(dir, 'sources')
        dos2unix(sourceDir, "**/*.move")
    }

    // Compile std package
    prepareSTDLib(dir, bin)

    return tasks.executeTask(new Task(
        {task, type: NAMESPACE},
        workdir,
        task,
        NAMESPACE,
        new ShellExecution([bin, command, path, commonArgs.join(' ')].join(' '))
    ));
}

/**
 * Create and prepare std lib
 * 
 * @param task 
 * @param command 
 * @param useFile 
 * @returns 
 */
function prepareSTDLib(workspace:string, moveBin:string) {
    let stdLibDir = Path.join(workspace, "build/package/starcoin/source_files")

    if (!fs.existsSync(stdLibDir)) {
        vscode.window.showInformationMessage('Prepare std lib...');

        // gen std lib
        cp.spawnSync(moveBin, ['check', 'build'], {
            cwd: workspace,
            encoding: 'latin1',
            stdio: 'inherit'
        });

        // dos to unix
        if (process.platform === 'win32') {
            dos2unix(stdLibDir, "**/*.move")
        }

        // publish stdlib
        cp.spawnSync(moveBin, ['publish', stdLibDir], {
            cwd: workspace,
            encoding: 'latin1',
            stdio: 'inherit'
        });
    }
}

/**
 * Get current open document workdir
 * 
 * @returns 
 */
function getWorkdirPath(): string {
    const document = window.activeTextEditor?.document;
    if (!document) {
        throw new Error('No document opened');
    }

    const workdir = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workdir) {
        throw new Error('Unable to read workspace folder');
    }

    // Current working (project) directory to set absolute paths.
    return workdir.uri.fsPath;
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

    const configuration = vscode.workspace.getConfiguration(NAMESPACE, document.uri);
    if (!configuration) {
        return Promise.reject('Unable to read configuration folder');
    }

    const workdir = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workdir) {
        return Promise.reject('Unable to read workdir folder');
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

    // Fix file format in windows
    if (process.platform === 'win32') {
        let sourceDir = Path.join(dir, 'integration-tests')
        dos2unix(sourceDir, "**/*.exp")
    }

    // fix HOME env not set in windows
    let homeDir = process.env.HOME
    if (process.platform === 'win32' && !homeDir) {
        homeDir = process.env.USERPROFILE
    }
    
    // @ts-ignore
    const opts: ShellExecutionOptions = {
        env: {
            "HOME": homeDir
        }
    }

    return tasks.executeTask(new Task(
        {task, type: NAMESPACE},
        workdir,
        task,
        NAMESPACE,
        new ShellExecution([bin, command, path, commonArgs.join(' ')].join(' '), opts)
    ));
}
