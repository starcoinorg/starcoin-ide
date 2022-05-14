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

import { sleep, getTaskResult } from './utils'
import { Downloader, currentDownloader } from '../../downloader';
import { installReleaseWithProgress } from '../../extension';

suite("Starcoin-IDE.functional.test", () => {
    /*
    suite("Move binary install test", () => {
        test("First install should download latest move binary", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)

            const loader:Downloader = currentDownloader(ext.extensionPath);
            fse.emptyDirSync(loader.binPath(""))

            // activate extension trigger install lastest move binary
            await ext.activate();

            // check version
            const version = fse.readFileSync(loader.versionPath, {
                encoding: "utf-8"
            })

            let {tag} = await loader.checkRelease(loader.latestVersion);
            assert.strictEqual(version, tag)
        });

        test("Upgrade should be ok", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)

            const loader:Downloader = currentDownloader(ext.extensionPath);
            fse.emptyDirSync(loader.binPath(""))

            // download older stable version
            let {tag, release} = await loader.checkRelease(loader.latestStableVersion);
            await installReleaseWithProgress(loader, tag, release)

            const olderVersion = fse.readFileSync(loader.versionPath, {encoding: "utf-8"})
            assert.strictEqual(olderVersion, tag)

            // reload extension active trigger upgrade
            if (!ext.isActive) {
                await ext.activate();
            } else {
                await vscode.commands.executeCommand("starcoin.reloadExtension");
            }
            
            // check version
            let version = await loader.checkRelease(loader.latestVersion);
            const newVersion = fse.readFileSync(loader.versionPath, {encoding: "utf-8"})
            assert.strictEqual(newVersion, version.tag)
        });
    });
    */
   
    suite("Move commands test", () => {
        test("test starcoin build commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.build");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

        test("test starcoin unit test commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.testUnit");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

        test("test starcoin integration test commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.testIntegration");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

        test("test starcoin mpm publish commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.publish");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

        test("test starcoin doctor commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.doctor");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

        test("test starcoin check compatibility commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.checkCompatibility");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

        test("test starcoin mpm release commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.release");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

        test("test starcoin clean commands", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)
            
            await ext.activate();
            await sleep(1000)
            
            try {
                // 1. get workdir
                let workDir = ""
                if (vscode.workspace.workspaceFolders) {
                    workDir = vscode.workspace.workspaceFolders[0].uri.fsPath
                }

                // 2. open doc
                let docs = await vscode.workspace.openTextDocument( path.join(workDir,  'sources/SimpleNFT.move'))
                await vscode.window.showTextDocument(docs);
                await sleep(1000)

                // 3. execute release command
                let releaseExec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.release");
                let releaseExitCode = await getTaskResult(releaseExec)
                await sleep(1000)
                assert.strictEqual(0, releaseExitCode)

                // 4. execute clean command
                let exec:vscode.TaskExecution = await vscode.commands.executeCommand("starcoin.clean");
                let exitCode = await getTaskResult(exec)
                await sleep(1000)
                assert.strictEqual(0, exitCode)
            } catch(err) {
                assert.fail("Error in test command, error: " + err)
            }
        });

    });
});