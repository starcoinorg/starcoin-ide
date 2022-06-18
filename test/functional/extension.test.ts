/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';
import * as fse from 'fs-extra';

import { sleep, getTaskResult } from './utils';
import { Downloader, currentDownloader } from '../../src/download';
import { installReleaseWithProgress } from '../../src/updater';

suite('Starcoin-IDE.functional.test', () => {
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

  suite('Move commands test', () => {
    test('test starcoin build commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.build');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin unit test commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.testUnit');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin integration test commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.testIntegration');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin mpm publish commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.publish');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin doctor commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.doctor');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin check compatibility commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.checkCompatibility');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin mpm release commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.release');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin clean commands', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute release command
        const releaseExec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.release');
        const releaseExitCode = await getTaskResult(releaseExec);
        await sleep(1000);
        assert.strictEqual(0, releaseExitCode);

        // 4. execute clean command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.clean');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin test file command for unit test', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'sources/SimpleNFT.move'));
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute testFile command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.testFile');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });

    test('test starcoin test file command for functional test', async () => {
      const ext = vscode.extensions.getExtension('starcoinorg.starcoin-ide');
      assert.ok(ext);

      await ext.activate();
      await sleep(1000);

      try {
        // 1. get workdir
        let workDir = '';
        if (vscode.workspace.workspaceFolders) {
          workDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }

        // 2. open doc
        const docs = await vscode.workspace.openTextDocument(
          path.join(workDir, 'integration-tests/test_simple_nft.move')
        );
        await vscode.window.showTextDocument(docs);
        await sleep(1000);

        // 3. execute testFile command
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand('starcoin.testFile');
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });
  });
});
