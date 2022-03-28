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

import { sleep, getTaskResult, executeStarcoinCheckCommandWithFixed } from './utils'
import { Downloader } from '../../downloader';
import { installReleaseWithProgress } from '../../extension';

suite("Starcoin-IDE.functional.test", () => {
    vscode.window.showInformationMessage('Start all tests.');

    suite("Move binary install test", () => {
        test("First install should download latest move binary", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            assert.strictEqual(ext.isActive, false)

            // remove move binary
            const downloader = new Downloader(ext.extensionPath)
            fse.emptyDirSync(downloader.binPath(""))

            // activate extension trigger install lastest move binary
            await ext.activate();

            // check version
            const version = fse.readFileSync(downloader.versionPath, {
                encoding: "utf-8"
            })

            assert.strictEqual(version, "v1.9.2")
        });


        test("Upgrade should be ok", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            assert.strictEqual(ext.isActive, false)

            // remove move binary
            const downloader = new Downloader(ext.extensionPath)
            fse.emptyDirSync(downloader.binPath(""))

            // download older version move binary
            await installReleaseWithProgress(downloader, "v1.9.0", {
                id: "8bd8af24-30ce-409f-bc07-b0918ec14380",
                url: "https://github.com",
                tag_name: "v1.9.0",
                browser_download_url: "https://github.com/starcoinorg/starcoin/releases/download/v1.9.0/starcoin-windows-latest.zip"
            })

            const olderVersion = fse.readFileSync(downloader.versionPath, {encoding: "utf-8"})
            assert.strictEqual(olderVersion, "v1.9.0")

            // active trigger upgrade
            await ext.activate();

            // check version
            const newVersion = fse.readFileSync(downloader.versionPath, {encoding: "utf-8"})
            assert.strictEqual(newVersion, "v1.9.2")
        });
    });

    suite("Move commands test", () => {
        test("test starcoin commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. open doc
                let docs = await vscode.workspace.openTextDocument( path.resolve(__dirname,  './my-counter/src/MyCounter.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 2. clean & prepare stdlib
                await vscode.commands.executeCommand("starcoin.clean");
                await executeStarcoinCheckCommandWithFixed();
                await vscode.commands.executeCommand("starcoin.publishStdLib");
                await sleep(1000)

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