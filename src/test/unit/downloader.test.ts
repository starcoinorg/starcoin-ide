/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os'
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as assert from 'assert';
import { Downloader } from '../../downloader';

suite("Downloader", () => {

    suite("#hasBinary", () => {
        test("new user hasBinary should be false", async () => {
            const loader = new Downloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));
            const result = loader.hasBinary()

            assert.equal(result, false);
        });

        test("after installRelease hasBinary should be true", async () => {
            const devPath = path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime())
            const loader = new Downloader(devPath);

            // make faker move
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.binPath("move"), "xxx");

            const result = loader.hasBinary()
            assert.equal(result, true);
        });
    });

    suite("#isBinaryOutdated", () => {
        test("v1.5.1 should outdated when new release is v1.5.6", async () => {
            const loader = new Downloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));

            // make faker version
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.versionPath, "v1.5.1");

            const result = loader.isBinaryOutdated("v1.5.6")
            assert.equal(result, true);
        });

        test("v1.5.1 should not outdated when new release is v1.5.1", async () => {
            const loader = new Downloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));

            // make faker version
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.versionPath, "v1.5.1");

            const result = loader.isBinaryOutdated("v1.5.1")
            assert.equal(result, false);
        });

        test("v1.5.1 should not outdated when new release is not found", async () => {
            const loader = new Downloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));

            // make faker version
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.versionPath, "v1.5.1");

            const result = loader.isBinaryOutdated("")
            assert.equal(result, false);
        });
    });
    
});