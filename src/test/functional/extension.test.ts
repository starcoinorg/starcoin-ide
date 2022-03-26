/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as fse from 'fs-extra';
import * as path from 'path';
import { sleep, getTaskResult } from './utils'

suite("Starcoin-IDE.functional.test", () => {
    vscode.window.showInformationMessage('Start all tests.');

    suite("Move Upgrade", () => {
        test("New install should download move cli", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)

            fse.emptyDirSync(path.join(ext.extensionPath, "bin"))
            await ext.activate();
        });

        test("The second lanch should not download", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)

            await ext.activate();
        });
    });

    suite("Move commands", () => {
        test("test starcoin commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            await ext.activate();

            try {
                // 1. open doc
                let docs = await vscode.workspace.openTextDocument( path.resolve(__dirname,  './my-counter/src/MyCounter.move'))
                await vscode.window.showTextDocument(docs);
                sleep(1000)

                // 2. clean & prepare stdlib
                await vscode.commands.executeCommand("starcoin.clean");
                await vscode.commands.executeCommand("starcoin.check");
                await vscode.commands.executeCommand("starcoin.publishStdLib");
                sleep(1000)

                // 3. check MyCounter.move
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.check");
                let exitCode = await getTaskResult(exec)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in executeCommand starcoin.check, error: " + err)
            }
        });
    });
});