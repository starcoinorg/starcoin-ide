/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Adapted from https://code.visualstudio.com/api/working-with-extensions/testing-extension
export function run(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 * 60 * 15); // 15分钟休息一下
  });
}
