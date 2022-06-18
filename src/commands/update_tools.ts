import * as vscode from 'vscode';
import { CommandFactory } from '.';
import { IDEExtensionContext } from '../context';

import { Downloader, Release, currentDownloader, currentAnalyzerDownloader } from '../download';

export function installReleaseWithProgress(loader: Downloader, version: string, release: Release): Thenable<void> {
  let lastVal = 0;

  return vscode.window.withProgress<void>(
    {
      location: vscode.ProgressLocation.Window,
      title: 'Downloading ' + loader.executateDesc + ' ' + version,
      cancellable: false
    },
    (progress) => {
      return loader.installRelease(version, release, (val: number) => {
        const offset = val - lastVal;
        lastVal = val;

        progress.report({ increment: offset * 100, message: 'Progress: ' + (val * 100).toFixed(2) + '%' });
      });
    }
  );
}

export async function checkAndUpdateWithDownlaoder(
  context: vscode.ExtensionContext,
  loader: Downloader
): Promise<void> {
  if (!loader.hasBinary()) {
    vscode.window.showWarningMessage('No ' + loader.executateDesc + ' found. Fetching latest version...');

    const { tag, release } = await loader.checkRelease(loader.latestVersion);

    try {
      await installReleaseWithProgress(loader, tag, release);
      vscode.window.showInformationMessage(loader.executateDesc + ' ' + tag + ' installed!');
    } catch (err: any) {
      vscode.window.showErrorMessage(loader.executateDesc + ' ' + tag + ' install failed, error: ' + err);
      return;
    }
  } else {
    const { tag, release } = await loader.checkRelease(loader.latestVersion);

    if (loader.isBinaryOutdated(tag)) {
      vscode.window.showInformationMessage('Newer ' + loader.executateDesc + ' found: ' + tag + '; Pulling...');

      try {
        await installReleaseWithProgress(loader, tag, release);
        vscode.window.showInformationMessage(loader.executateDesc + ' updated!');
      } catch (err: any) {
        vscode.window.showErrorMessage(loader.executateDesc + ' update failed, error: ', err);
      }
    }
  }
}

export async function checkAndUpdateMpm(ctx: IDEExtensionContext): Promise<void> {
  const loader: Downloader = currentDownloader(ctx.vscode.extensionPath);
  await checkAndUpdateWithDownlaoder(ctx.vscode, loader);
  ctx.mpmBin = loader.executatePath
}

export async function checkAndUpdateMoveAnalyzer(ctx: IDEExtensionContext): Promise<void> {
  const loader: Downloader = currentAnalyzerDownloader(ctx.vscode.extensionPath);
  await checkAndUpdateWithDownlaoder(ctx.vscode, loader);
  ctx.moveAnalyzerBin = loader.executatePath
}

/**
 *
 *  Check for the binary every time extension is activated. Either install latest
 *  version if binary is not found or fetch for newer version. If it is found, then
 *  pull and install it.
 *
 * @param context
 * @returns
 */
 export const checkAndUpdateAll: CommandFactory = (ctx: IDEExtensionContext) => {
  return async (): Promise<void> => {
    await checkAndUpdateMpm(ctx);
    await checkAndUpdateMoveAnalyzer(ctx);
  };
};
