/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os'
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as assert from 'assert';
import { MoveDownloader, MPMDownloader } from '../../downloader';

suite("Downloader", () => {

    suite("#checkNewRelease", () => {
        test("check move new relase should be ok", async () => {
            const loader = new MoveDownloader(os.tmpdir());
            const result = await loader.checkRelease(loader.latestVersion)
            
            assert.ok(result.tag, 'Check new release latest tag should be ok');
            assert.ok(result.release, 'Check new release should be ok');
            assert.ok(result.release.browser_download_url, 'Check new release browser_download_url should be ok');
        });
    })

    suite("#hasBinary", () => {
        test("new user hasBinary should be false", async () => {
            const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));
            const result = loader.hasBinary()

            assert.strictEqual(result, false);
        });

        test("after installRelease hasBinary should be true", async () => {
            const devPath = path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime())
            const loader = new MoveDownloader(devPath);

            // make faker move
            fse.mkdirsSync(loader.binPath(""))
            fse.writeFileSync(loader.executatePath, "xxx");

            const result = loader.hasBinary()
            assert.strictEqual(result, true);
        });
    });

    suite("#isBinaryOutdated", () => {
        test("v1.5.1 should outdated when new release is v1.5.6", async () => {
            const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));

            // make faker version
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.versionPath, "v1.5.1");

            const result = loader.isBinaryOutdated("v1.5.6")
            assert.strictEqual(result, true);
        });

        test("v1.5.1 should not outdated when new release is v1.5.1", async () => {
            const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));

            // make faker version
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.versionPath, "v1.5.1");

            const result = loader.isBinaryOutdated("v1.5.1")
            assert.strictEqual(result, false);
        });

        test("v1.10.1 should outdated when new release is v1.11.1-alpha", async () => {
            const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));

            // make faker version
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.versionPath, "v1.10.1");

            const result = loader.isBinaryOutdated("v1.11.1-alpha")
            assert.strictEqual(result, true);
        });

        test("v1.5.1 should not outdated when new release is not found", async () => {
            const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));

            // make faker version
            fse.mkdirsSync(loader.binPath(""))
            fs.writeFileSync(loader.versionPath, "v1.5.1");

            const result = loader.isBinaryOutdated("")
            assert.strictEqual(result, false);
        });
    });
    
});