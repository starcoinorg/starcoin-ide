import * as vscode from 'vscode';
import * as assert from 'assert';
import * as fse from 'fs-extra';

import { sleep } from './utils';
import { Downloader, currentDownloader } from '../../src/download';
import { installReleaseWithProgress } from '../../src/commands/update_tools';

suite('Tool update test', () => {
  suite('Move binary install test', () => {
    test('First install should download latest move binary', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      const loader: Downloader = currentDownloader(ext.extensionPath);
      await fse.emptyDir(loader.binPath(''));
      await sleep(1000);

      // activate extension trigger install lastest move binary
      if (!ext.isActive) {
        await ext.activate();
        await sleep(1000);
      } else {
        await vscode.commands.executeCommand('starcoin.reloadExtension');
      }

      // check version
      const version = fse.readFileSync(loader.versionPath, {
        encoding: 'utf-8'
      });

      const { tag } = await loader.checkRelease(loader.latestVersion);
      assert.strictEqual(version, tag);
    });

    test('Upgrade should be ok', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      const loader: Downloader = currentDownloader(ext.extensionPath);
      fse.emptyDirSync(loader.binPath(''));

      // download older stable version
      const { tag, release } = await loader.checkRelease(loader.latestStableVersion);
      await installReleaseWithProgress(loader, tag, release);

      const olderVersion = fse.readFileSync(loader.versionPath, { encoding: 'utf-8' });
      assert.strictEqual(olderVersion, tag);

      // reload extension active trigger upgrade
      if (!ext.isActive) {
        await ext.activate();
        await sleep(1000);
      } else {
        await vscode.commands.executeCommand('starcoin.reloadExtension');
      }

      // check version
      const version = await loader.checkRelease(loader.latestVersion);
      const newVersion = fse.readFileSync(loader.versionPath, { encoding: 'utf-8' });
      assert.strictEqual(newVersion, version.tag);
    });
  });
});
