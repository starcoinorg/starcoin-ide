/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as os from 'os';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as assert from 'assert';
import { MoveDownloader } from '../../src/download/move';

suite('Downloader', () => {
  suite('#isBinaryOutdated', () => {
    test('v1.5.1 should outdated when new release is v1.5.6', async () => {
      const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', 'test', '' + new Date().getTime()));

      // make faker version
      fse.mkdirsSync(loader.binPath(''));
      fs.writeFileSync(loader.versionPath, 'v1.5.1');

      const result = loader.isBinaryOutdated('v1.5.6');
      assert.strictEqual(result, true);
    });

    test('v1.5.1 should not outdated when new release is v1.5.1', async () => {
      const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', 'test', '' + new Date().getTime()));

      // make faker version
      fse.mkdirsSync(loader.binPath(''));
      fs.writeFileSync(loader.versionPath, 'v1.5.1');

      const result = loader.isBinaryOutdated('v1.5.1');
      assert.strictEqual(result, false);
    });

    test('v1.10.1 should outdated when new release is v1.11.1-alpha', async () => {
      const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', 'test', '' + new Date().getTime()));

      // make faker version
      fse.mkdirsSync(loader.binPath(''));
      fs.writeFileSync(loader.versionPath, 'v1.10.1');

      const result = loader.isBinaryOutdated('v1.11.1-alpha');
      assert.strictEqual(result, true);
    });

    test('v1.5.1 should not outdated when new release is not found', async () => {
      const loader = new MoveDownloader(path.join(os.tmpdir(), 'starcoin-ide', 'test', '' + new Date().getTime()));

      // make faker version
      fse.mkdirsSync(loader.binPath(''));
      fs.writeFileSync(loader.versionPath, 'v1.5.1');

      const result = loader.isBinaryOutdated('');
      assert.strictEqual(result, false);
    });
  });
});
