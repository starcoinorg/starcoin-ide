/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Adapted from https://code.visualstudio.com/api/working-with-extensions/testing-extension

import * as path from 'path';
import * as cp from 'child_process';
import { runTests, downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import { TestOptions } from '@vscode/test-electron/out/runTest';

async function main(): Promise<void> {
  // The folder containing the Extension Manifest package.json
  // Passed to `--extensionDevelopmentPath`
  const extensionDevelopmentPath = path.resolve(__dirname, '../../../');

  // The path to test runner
  // Passed to --extensionTestsPath
  const extensionTestsPath = path.resolve(__dirname, './index');

  // The workspace
  let testWorkspace = path.resolve(__dirname, './demos/simple-nft-mpm');
  let testWorkspacePath = path.resolve(testWorkspace, './simple-nft.code-workspace');
  if (process.platform === 'win32') {
    testWorkspacePath = path.resolve(testWorkspace, './simple-nft.code-workspace');
  }

  // Install vscode and depends extension
  const vscodeVersion = '1.64.0';
  const vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);
  const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
  cp.spawnSync(cli, [...args, '--install-extension', 'damirka.move-syntax', '--force'], {
    encoding: 'utf-8',
    stdio: 'inherit'
  });

  // Run vscode tests
  const options: TestOptions = {
    vscodeExecutablePath: vscodeExecutablePath,
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [testWorkspacePath],
    extensionTestsEnv: {
      DEBUGTELEMETRY: '1',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      MOCHA_grep: process.env.MOCHA_grep
    }
  };

  console.log(`Test options: ${JSON.stringify(options)}`);

  // Download VS Code, unzip it and run the integration test
  try {
    await runTests(options);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
