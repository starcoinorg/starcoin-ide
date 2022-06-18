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
import { Downloader, MoveDownloader, MPMDownloader, Release, currentDownloader } from './download';
    
// @ts-ignore
const {commands, window, tasks, Task, ShellExecution, ShellExecutionOptions} = vscode;
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

    context.subscriptions.push(
        registerCommand('starcoin.reloadExtension', () => reloadExtensionCommand(context)),
    );

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
        registerCommand('starcoin.build', mpmBuildCommand),
        registerCommand('starcoin.testUnit', mpmTestUnitCommand),
        registerCommand('starcoin.testIntegration', mpmTestIntegrationCommand),
        registerCommand('starcoin.testFile', mpmTestFileCommand),
        registerCommand('starcoin.publish', mpmPublishCommand),
        registerCommand('starcoin.doctor', mpmDoctorCommand),
        registerCommand('starcoin.checkCompatibility', mpmCheckCompatibilityCommand),
        registerCommand('starcoin.release', mpmReleaseCommand),
        registerCommand('starcoin.clean', mpmCleanCommand),
    );
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

// mpm commands
function mpmBuildCommand(): Thenable<any> { return mpmExecute('build', 'package build', Marker.None); }
function mpmTestUnitCommand(): Thenable<any> { return mpmExecute('testUnit', 'package test', Marker.None); }
function mpmTestIntegrationCommand(): Thenable<any> { return mpmExecute('testIntegration', 'integration-test', Marker.None); }
function mpmTestFileCommand(): Thenable<any> { 
    const document = window.activeTextEditor?.document;
    if (!document) {
        throw new Error('No document opened');
    }

    const path = document.uri.fsPath.toString()
    var extension = Path.extname(path);
    const fileName = Path.basename(path, extension)

    if (path.indexOf('integration-tests') > -1) {
        return mpmExecute('testIntegration', 'integration-test', Marker.None,{
            shellArgs: [fileName]
        }); 
    } else if  (path.indexOf('sources') > -1) {
        return mpmExecute('testUnit', 'package test', Marker.None, {
            shellArgs: ["--filter", fileName]
        }); 
    } else {
        throw new Error('No sources or integration-tests file selected!');
    }
}

function mpmPublishCommand(): Thenable<any> { return mpmExecute('publish', 'sandbox publish', Marker.None); }
function mpmDoctorCommand(): Thenable<any> { return mpmExecute('doctor', 'sandbox doctor', Marker.None); }
function mpmCheckCompatibilityCommand(): Thenable<any> { return mpmExecute('checkCompatibility', 'check-compatibility', Marker.None); }
function mpmReleaseCommand(): Thenable<any> { return mpmExecute('release', 'release', Marker.None); }
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
 * Options for a shell execution
 */
export interface CommandExecutionOptions {
    /**
     * The arguments to be passed to the shell executable used to run the task. Most shells
     * require special arguments to execute a command. For  example `bash` requires the `-c`
     * argument to execute a command, `PowerShell` requires `-Command` and `cmd` requires both
     * `/d` and `/c`.
     */
    shellArgs?: string[];

    /**
     * The current working directory of the executed shell.
     * If omitted the tools current workspace root is used.
     */
    cwd?: string;

    /**
     * The additional environment of the executed shell. If omitted
     * the parent process' environment is used. If provided it is merged with
     * the parent process' environment.
     */
    env?: { [key: string]: string };
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
// @ts-ignore
function mpmExecute(task: string, command: string, fileMarker: Marker, cmdOpts?: CommandExecutionOptions): Thenable<any> {
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
    const opts:ShellExecutionOptions  = {
        env: {
            "HOME": homeDir
        }
    }

    let args:string[] = []

    if (command) {
        args = args.concat(command.split(' '))
    }
   
    if (path) {
        args = args.concat(path)
    }

    if (cmdOpts?.shellArgs) {
        args = args.concat(cmdOpts.shellArgs)
    }

    if (cmdOpts?.cwd) {
        opts.cwd = cmdOpts.cwd
    }

    if (cmdOpts?.env) {
        opts.env = {
            ...cmdOpts.env,
            ...opts.env
        }
    }

    return tasks.executeTask(new Task(
        {task, type: NAMESPACE},
        workdir,
        task,
        NAMESPACE,
        new ShellExecution(bin, args, opts)
    ));
}
