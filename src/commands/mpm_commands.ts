import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as Path from 'path';
import * as vscode from 'vscode';

import { dos2unix } from '../utils';
import { CommandFactory } from '.';
import { IDEExtensionContext } from '../context';

const { window, tasks, Task, ShellExecution } = vscode;

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

/**
 * Options for a shell execution
 */
interface CommandExecutionOptions {
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
async function mpmExecute(
  ideCtx: IDEExtensionContext,
  task: string,
  command: string,
  fileMarker: Marker,
  uri?: vscode.Uri,
  cmdOpts?: CommandExecutionOptions
): Promise<Thenable<any>> {
  // Check uri, or select from patelle list manually
  uri = uri ? uri : await selectMoveProjectFile();
  
  const extPath = vscode.extensions.getExtension(ideCtx.extension)?.extensionPath;

  if (!extPath) {
    return Promise.reject('Unable to find the extension');
  }

  const configuration = vscode.workspace.getConfiguration(ideCtx.namespace, uri);
  if (!configuration) {
    return Promise.reject('Unable to read configuration folder');
  }

  const workdir = vscode.workspace.getWorkspaceFolder(uri);
  if (!workdir) {
    return Promise.reject('Unable to read workdir folder');
  }

  // Current working (project) directory to set absolute paths.
  const dir = workdir.uri.fsPath;

  // Get binary path which is always inside `extension/bin` directory.
  const bin = Path.join(extPath, 'bin', process.platform === 'win32' ? 'mpm.exe' : 'mpm');

  // Set path using the passed Marker. Each binary command has
  // its own requirements for the path to pass into it.
  let path = '';
  switch (fileMarker) {
    case Marker.None:
      path = '';
      break;
    case Marker.ThisFile:
      path = uri.fsPath.toString() || '';
      break;
    case Marker.WorkDir:
      path = dir;
      break;
    case Marker.SrcDir:
      path = Path.join(dir, 'sources');
      break;
  }

  // Fix file format in windows
  if (process.platform === 'win32') {
    const intDir = Path.join(dir, 'integration-tests');
    if (fs.existsSync(intDir)) {
      dos2unix(intDir, '**/*.exp');
    }

    const specDir = Path.join(dir, 'spectests');
    if (fs.existsSync(specDir)) {
      dos2unix(specDir, '**/*.exp');
    }
  }

  // fix HOME env not set in windows
  let homeDir = process.env.HOME;
  if (process.platform === 'win32' && !homeDir) {
    homeDir = process.env.USERPROFILE;
  }

  const opts: vscode.ShellExecutionOptions = {
    env: {}
  };

  let args: string[] = [];

  if (command) {
    args = args.concat(command.split(' '));
  }

  const commandOpts = ideCtx.config.getCommandOptions(`mpm ${command}`);
  ideCtx.logger.info(`Command mpm ${command} opts: ` + JSON.stringify(commandOpts));
  if ('OPTIONS' in commandOpts) {
    args = args.concat(commandOpts['OPTIONS']);
  }

  if (cmdOpts?.shellArgs) {
    args = args.concat(cmdOpts.shellArgs);
  }

  if (path) {
    args = args.concat(path);
  }

  if (cmdOpts?.cwd) {
    opts.cwd = cmdOpts.cwd;
  } else {
    // set the file path as cwd
    opts.cwd = getCwd(uri);
  }

  if (cmdOpts?.env) {
    opts.env = {
      ['HOME']: homeDir || '',
      ...cmdOpts.env,
      ...opts.env
    };
  }

  return tasks.executeTask(
    new Task({ task, type: ideCtx.namespace }, workdir, task, ideCtx.namespace, new ShellExecution(bin, args, opts))
  );
}

// Block of function definitions for each command of the extension. All these functions use the
// same interface execute(), so see it below for the details.

export const mpmBuild: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    return mpmExecute(ctx, 'build', 'package build', Marker.None, uri);
  };
};

export const mpmTestUnit: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    return mpmExecute(ctx, 'testUnit', 'package test', Marker.None, uri);
  };
};

export const mpmTestIntegration: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    return mpmExecute(ctx, 'testIntegration', 'integration-test', Marker.None, uri);
  };
};

export const mpmTestUnitFile: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    const document = window.activeTextEditor?.document;
    if (!document) {
      throw new Error('No document opened');
    }

    const path = document.uri.fsPath.toString();
    const extension = Path.extname(path);
    const fileName = Path.basename(path, extension);

    return mpmExecute(ctx, 'testUnit', 'package test', Marker.None, uri, { shellArgs: ['--filter', fileName] });
  };
};

export const mpmTestIntegrationFile: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    const document = window.activeTextEditor?.document;
    if (!document) {
      throw new Error('No document opened');
    }

    const path = document.uri.fsPath.toString();
    const extension = Path.extname(path);
    const fileName = Path.basename(path, extension);

    return mpmExecute(ctx, 'testIntegration', 'integration-test', Marker.None, uri, { shellArgs: [fileName] });
  };
};

export const mpmUpdateIntegrationTestBaseline: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    const document = window.activeTextEditor?.document;
    if (!document) {
      throw new Error('No document opened');
    }

    const path = document.uri.fsPath.toString();
    const extension = Path.extname(path);
    const fileName = Path.basename(path, extension);

    if (path.endsWith('Move.toml')) {
      return mpmExecute(ctx, 'testIntegration', 'integration-test', Marker.None, uri, { shellArgs: ['--ub'] });
    } else {
      return mpmExecute(
        ctx,
        'testIntegration',
        'integration-test',
        Marker.None,
        uri,
        { shellArgs: [fileName, '--ub'] }
      );
    }
  };
};

export const mpmTestFunction = (ctx: IDEExtensionContext) => {
  return async (filter: string): Promise<void> => {
    const document = window.activeTextEditor?.document;
    if (!document) {
      throw new Error('No document opened');
    }

    return mpmExecute(ctx, 'testUnit', 'package test', Marker.None, undefined, {
      shellArgs: ['--filter', filter]
    });
  };
};

export const mpmPublish: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    return mpmExecute(ctx, 'publish', 'sandbox publish', Marker.None, uri);
  };
};

export const mpmDoctor: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    return mpmExecute(ctx, 'doctor', 'sandbox doctor', Marker.None, uri);
  };
};

export const mpmCheckCompatibility: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    return mpmExecute(ctx, 'checkCompatibility', 'check-compatibility', Marker.None, uri);
  };
};

export const mpmRelease: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    return mpmExecute(ctx, 'release', 'release', Marker.None, uri);
  };
};

export const mpmClean: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (uri): Promise<void> => {
    // cd target move package dir, clean release dir
    if (!uri) {
      uri = await selectMoveProjectFile();
    }
    const releaseDir = Path.join(getCwd(uri), 'release');
    if (fs.existsSync(releaseDir)) {
      fse.rmdirSync(releaseDir, {
        recursive: true
      });
    }

    return mpmExecute(ctx, 'clean', 'sandbox clean', Marker.None, uri);
  };
};

async function selectMoveProjectFile(): Promise<vscode.Uri> {
  // select all move package folder via finding Move.toml
  return await vscode.workspace.findFiles('**/Move.toml').then<vscode.Uri>((options) => {
    if (options.length === 0) {
      Promise.reject('No move package find');
    }
    // Only one move-project, return the Move.toml file folder path
    if (options.length === 1) {
      return options[0];
    }
    // Exists multi move package, user confirm which one will run
    return window
      .showQuickPick(
        options.flatMap((v) => {
          return v.fsPath;
        })
      )
      .then((selected) => {
        return selected ? vscode.Uri.parse(selected) : Promise.reject('Please select a package file');
      });
  });
}

/**
 * Get the closest folder path, As shown in the vscode.Url
 *
 * @param uri
 * @returns fsPath
 */
function getCwd(uri: vscode.Uri) {
  // if file uri, return the closest folder path
  if (uri.scheme === 'file') {
    return vscode.Uri.joinPath(uri, '../').fsPath;
  }
  // TODO add more scheme check
  return uri.fsPath;
}
