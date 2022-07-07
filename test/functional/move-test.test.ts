/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';

import { sleep } from './utils';

suite('Starcoin-IDE.functional.test', () => {
  suite('Move-test test', () => {
    test('test explore all tests', async () => {
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
        const tests:Generator<vscode.TestItem> = await vscode.commands.executeCommand('starcoin.tests');
        assert.ok(tests);

		const rootItem = tests.next();
		assert.ok(rootItem);
		assert.deepStrictEqual(rootItem.value.label, "SimpleNFT.move")

		const testItem = tests.next();
		assert.ok(testItem);
		assert.deepStrictEqual(testItem.value.label, "this_is_a_test")
      } catch (err) {
        assert.fail('Error in test command, error: ' + err);
      }
    });
  });
});
