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
import * as myExtension from '../../extension';

suite("Starcoin-IDE.functional.test", () => {
    vscode.window.showInformationMessage('Start all tests.');

    suite("#installRelease", () => {
        test("New install should download move cli", async () => {
            const ext = vscode.extensions.getExtension("starcoinorg.starcoin-ide");
            assert.ok(ext)

            fse.emptyDirSync(path.join(ext.extensionPath, "bin"))

            // sleep 3s
            const timer = (ms:number) => new Promise( res => setTimeout(res, ms));
            await timer(3000);

            await ext.activate();
        });
    });
});