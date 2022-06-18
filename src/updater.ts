import * as vscode from 'vscode';
import { Downloader, Release, currentDownloader, currentAnalyzerDownloader } from './download';

export function installReleaseWithProgress(loader: Downloader, version: string, release: Release): Thenable<void> {
  let lastVal: number = 0;

  return vscode.window.withProgress<void>(
    {
      location: vscode.ProgressLocation.Window,
      title: 'Downloading ' + loader.executateDesc + ' ' + version,
      cancellable: false
    },
    (progress) => {
      return loader.installRelease(version, release, function (val: number) {
        let offset = val - lastVal;
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

    let { tag, release } = await loader.checkRelease(loader.latestVersion);

    try {
      await installReleaseWithProgress(loader, tag, release);
      vscode.window.showInformationMessage(loader.executateDesc + ' ' + tag + ' installed!');
    } catch (err: any) {
      vscode.window.showErrorMessage(loader.executateDesc + ' ' + tag + ' install failed, error: ' + err);
      return;
    }
  } else {
    let { tag, release } = await loader.checkRelease(loader.latestVersion);

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

export async function checkAndUpdateMpm(context: vscode.ExtensionContext): Promise<void> {
  const loader: Downloader = currentDownloader(context.extensionPath);
  await checkAndUpdateWithDownlaoder(context, loader);
}

export async function checkAndUpdateMoveAnalyzer(context: vscode.ExtensionContext): Promise<void> {
  const loader: Downloader = currentAnalyzerDownloader(context.extensionPath);
  await checkAndUpdateWithDownlaoder(context, loader);
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
export async function checkAndUpdateAll(context: vscode.ExtensionContext): Promise<void> {
  await checkAndUpdateMpm(context);
  await checkAndUpdateMoveAnalyzer(context);
}
