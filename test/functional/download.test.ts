/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as assert from 'assert';
import { MPMDownloader } from '../../src/download/mpm';

suite('Downloader', () => {
  suite('#checkNewRelease', () => {
    test('check move new release should be ok', async () => {
      const loader = new MPMDownloader(os.tmpdir());
      const result = await loader.checkRelease(loader.latestVersion);

      assert.ok(result.tag, 'Check new release latest tag should be ok');
      assert.ok(result.release, 'Check new release should be ok');
      assert.ok(result.release.browser_download_url, 'Check new release browser_download_url should be ok');
    });
  });

  suite('#hasBinary', () => {
    test('new user hasBinary should be false', async () => {
      const loader = new MPMDownloader(path.join(os.tmpdir(), 'starcoin-ide', 'test', '' + new Date().getTime()));
      const result = loader.hasBinary();

      assert.strictEqual(result, false);
    });

    test('after installRelease hasBinary should be true', async () => {
      const devPath = path.join(os.tmpdir(), 'starcoin-ide', 'test', '' + new Date().getTime());
      const loader = new MPMDownloader(devPath);

      // make faker move
      fse.mkdirsSync(loader.binPath(''));
      fse.writeFileSync(loader.executatePath, 'xxx');
      fse.writeFileSync(loader.versionPath, 'v0.1.0');

      const result = loader.hasBinary();
      assert.strictEqual(result, true);
    });
  });
});
