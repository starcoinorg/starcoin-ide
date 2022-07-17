/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';

import { sleep, getTaskResult } from './utils';

suite('Starcoin-IDE.functional.test', () => {
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

    test('test starcoin test file command for functional test with old spectests dir', async () => {
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
        const docs = await vscode.workspace.openTextDocument(path.join(workDir, 'spectests/test_simple_nft.move'));
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

    test('test starcoin test function command', async () => {
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
        const exec: vscode.TaskExecution = await vscode.commands.executeCommand(
          'starcoin.testFunction',
          'this_is_a_test'
        );
        const exitCode = await getTaskResult(exec);
        await sleep(1000);
        assert.strictEqual(0, exitCode);
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });
  });
});
