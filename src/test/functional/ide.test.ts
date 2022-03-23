/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os'
import * as path from 'path';
import * as assert from 'assert';
import { Downloader } from '../../downloader';

suite("Starcoin IDE", () => {

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