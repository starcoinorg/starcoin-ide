/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os'
import * as path from 'path';
import * as assert from 'assert';
import { Downloader } from '../downloader';

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

            assert.equal(result, false, 'Check new release latest tag should be ok');
        });
    });

    suite("#installRelease", () => {
        test("check update and force install release should be ok", async () => {
            const loader = new Downloader(os.tmpdir());
            let {latest, release} = await loader.checkNewRelease()

            try {
                await loader.installRelease(latest, release);
            } catch(err) {
                console.error(err);
                assert.fail("install release should be ok, error:" + err)
            }
        });
    });
    
});