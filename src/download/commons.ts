/**
 * Binary downloader for the Starcoin IDE.
 *
 * @copyright 2021 StarCoin
 */

import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as https from 'https';
import * as wget from 'wget-improved';
import { env } from 'process';

import * as unzip from 'unzipper';

// @ts-ignore
const PLATFORM = {
  darwin: 'macos',
  win32: 'windows',
  linux: 'ubuntu'
}[process.platform];

/**
 * GitHub Release information interface.
 */
export interface Release {
  id: string;
  url: string;
  tag_name: string;
  browser_download_url: string;
}

/**
 * GitHub Release information interface.
 */
export interface Downloader {
  executateName: string;
  executateDesc: string;
  latestVersion: string;
  latestStableVersion: string;
  executatePath: string;
  zipPath: string;
  versionPath: string;
  binPath(file: string): string;
  installRelease(version: string, release: Release, progressCallback: (progress: number) => void): Promise<void>;
  checkRelease(version: string): Promise<any>;
  isBinaryOutdated(latest: string): boolean;
  hasBinary(): boolean;
}

/**
 * Install a release from the version string and the details object.
 * 1. Pull the release from GitHub.
 * 2. Unzip it into bin folder.
 * 3. Keep only `move` binary.
 * 4. Write version file for updates.
 *
 * @param this
 * @param version
 * @param release
 */
export async function installRelease(
  loader: Downloader,
  version: string,
  release: Release,
  progressCallback: (progress: number) => void
) {
  const destroy = require('destroy');

  // Create bin dirs
  const binDir = loader.binPath('');
  if (!fs.existsSync(binDir)) {
    fse.mkdirsSync(binDir);
  }

  // Remove the old binaries and the zip archive if there were.
  {
    if (fs.existsSync(loader.zipPath)) {
      fse.rmSync(loader.zipPath);
    }
  }

  // Pull the release zip file from the GitHub releases.
  await new Promise((resolve, reject) => {
    let dest = loader.executatePath + '.new';
    if (isZip(release)) {
      dest = loader.zipPath;
    }

    const downloader: any = wget
      .download(release.browser_download_url, dest, {})
      .on('error', (err) => {
        console.log('download error: ', err);
        reject(err);
      })
      .on('timeout', () => {
        console.log('download timeout');
        reject('Network read timeout error');
      })
      .on('start', (fileSize) => {
        if (progressCallback !== null) {
          progressCallback(0);
        }

        // Set network read timeout 20s
        downloader.req.setTimeout(20000, () => {
          downloader.req.abort();
          console.log('download timeout');
          reject('Network read timeout error');
        });
      })
      .on('end', (output) => {
        resolve(null);
      })
      .on('progress', (progress) => {
        if (progressCallback !== null) {
          progressCallback(progress);
        }
      });
  });

  if (isZip(release)) {
    // Unzip this file and do a cleanup.
    const rs = fs.createReadStream(loader.zipPath);

    try {
      await new Promise((resolve, reject) => {
        rs.pipe(unzip.Parse())
          // @ts-ignore
          .on('entry', (entry) => {
            const fileName = entry.path.split('/')[1];

            if (fileName === loader.executateName) {
              const dest = loader.executatePath + '.new';
              entry.pipe(fs.createWriteStream(dest)).on('finish', resolve).on('error', reject);
            } else {
              entry.autodrain();
            }
          })
          .on('close', resolve)
          .on('error', reject);
      });
    } finally {
      destroy(rs);
    }

    // Do a cleanup
    fse.rmSync(loader.zipPath);
  }

  // Remove old executate
  if (fs.existsSync(loader.executatePath)) {
    fse.rmSync(loader.executatePath);
  }

  // Update with new executate
  fse.renameSync(loader.executatePath + '.new', loader.executatePath);
  fse.chmodSync(loader.executatePath, '777');
  fse.writeFileSync(loader.versionPath, version);
}

/**
 * Compare the version file with the latest update from GitHub.
 * Turn semvers into numbers by removing non-digits.
 *
 * @param this
 * @param latest
 * @returns
 */
export function isBinaryOutdated(loader: Downloader, latest: string): boolean {
  const compareVersions = require('node-version-compare');
  const version = fs.readFileSync(loader.versionPath).toString();

  // Compare versions against each other. If current one is less than new one - update.
  return compareVersions(version, latest) < 0;
}

/**
 * Check release whether is zip file
 *
 * @param release
 * @returns
 */
function isZip(release: Release): boolean {
  return release.browser_download_url.endsWith('.zip');
}

/**
 * Check whether the binary exists.
 * `move` for linux/darwin, `move.exe` for Windows.
 *
 * @param loader
 * @returns
 */
export function hasBinary(loader: Downloader): boolean {
  return fs.existsSync(loader.executatePath);
}

/**
 * Fetch latest release information from GitHub.
 *
 * @param loader
 * @returns
 */
export async function checkNewRelease(
  loader: Downloader,
  gitRepo: string,
  version: string,
  name: string
): Promise<any> {
  const options = {
    host: 'api.github.com',
    path: `/repos/${gitRepo}/releases/tags/` + version,
    method: 'GET',
    headers: { 'user-agent': 'node.js' }
  };

  const githubToken = env.GITHUB_TOKEN;
  if (githubToken) {
    // @ts-ignore
    options.headers['authorization'] = 'Bearer ' + githubToken;
  }

  if (version === 'latest') {
    options.path = `/repos/${gitRepo}/releases/latest`;
  }

  const stats = await new Promise((resolve, reject) => {
    https
      .get(options, (res) => {
        let body = '';
        res.on('data', (data) => (body += data.toString()));
        res.on('end', () => resolve(JSON.parse(body)));
        res.on('error', reject);
      })
      .on('error', (e) => {
        reject(e);
      });
  });

  // console.log("checkNewRelease version:", version, "name:", name, "stats:", stats);

  // @ts-ignore
  const latest = stats.tag_name;

  // @ts-ignore
  // Important! This line searches for a release with "starcoin" and "<PLATFORM>" in its name
  const release = stats.assets?.find((a) => a && a.name && a.name.includes(PLATFORM) && a.name.includes(name)) || null;

  if (!latest || !release) {
    throw new Error('Release not found');
  }

  if (release !== null) {
    delete release.uploader;
  }

  return {
    tag: latest,
    release: release
  };
}
