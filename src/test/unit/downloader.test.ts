/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os'
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';
import { Downloader } from '../../downloader';
import { mkdirsSync } from '../../utils'

suite("Downloader", () => {
    suite("#checkNewRelease", () => {
        test("check new relase should be ok", async () => {
            const loader = new Downloader(os.tmpdir());
            const result = await loader.checkNewRelease()

            assert.ok(result.latest, 'Check new release latest tag should be ok');
            assert.ok(result.release, 'Check new release should be ok');
            assert.ok(result.release.browser_download_url, 'Check new release browser_download_url should be ok');
        });
    });

    suite("#hasBinary", () => {
        test("new user hasBinary should be false", async () => {
            const loader = new Downloader(path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime()));
            const result = loader.hasBinary()

            assert.equal(result, false);
        });

        test("after installRelease hasBinary should be true", async () => {
            const devPath = path.join(os.tmpdir(), 'starcoin-ide', "test", "" + new Date().getTime())
            const loader = new Downloader(devPath);
            mkdirsSync(loader.binPath(""))
            
            fs.writeFileSync(loader.binPath("move"), "xxx");
            const result = loader.hasBinary()
            assert.equal(result, true);
        });
    });
    
});