/**
 * Binary downloader for the Starcoin IDE.
 * 
 * @copyright 2021 StarCoin
 */

import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';
import * as https from 'https';

// @ts-ignore
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
interface Release {
    id: string,
    url: string,
    tag_name: string,
    browser_download_url: string
}


/**
 * Downloader is a class that handles binary info fetching, 
 * binary downloads and version comparisons. It operates over the 
 * <extensionPath>/bin folder and stores all the needed information and
 * executables there.
 */
export class Downloader {
    extensionPath: string

    get zipPath(): string {
        return this.binPath('fethed.zip');
    }

    get versionPath(): string {
        return this.binPath('.version');
    }

    binPath(file: string): string {
        return path.join(this.extensionPath, 'bin', file);
    }
    
    constructor(extPath: string) {
        this.extensionPath = extPath;
    }

    async installRelease(version: string, release: Release): Promise<void> {
        return installRelease.call(this, version, release);
    }

    async checkNewRelease(): Promise<any> {
        return checkNewRelease.call(this)
    }

    isBinaryOutdated(latest: string): boolean {
        return isBinaryOutdated.call(this, latest);
    }

    hasBinary(): boolean {
        return hasBinary.call(this);
    }
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
async function installRelease(this: Downloader, version: string, release: Release) {
    const parsed = new url.URL(release.browser_download_url);
    const options = {
        host: parsed.host,
        path: parsed.pathname,
        headers: {'user-agent': 'node.js'}
    };

    // Remove the old binaries and the zip archive if there were.
    {
        if (fs.existsSync(this.binPath('move'))) {
            fs.rmSync(this.binPath('move'));
        } 
        
        if (fs.existsSync(this.binPath('move.exe'))) {
            fs.rmSync(this.binPath('move.exe'));
        }
    
        if (fs.existsSync(this.zipPath)) {
            fs.rmSync(this.zipPath);
        }
    };
    

    // Pull the release zip file from the GitHub releases.
    await new Promise((resolve) => {
        https.get(options, (res) => {
            const dest = this.zipPath;

            if (!res.headers.location) {
                return resolve(null);
            }

            const parsed = new url.URL(res.headers.location);
            const options = {
                host: parsed.host,
                path: parsed.pathname + parsed.search,
                headers: {'user-agent': 'node.js'}
            };

            https.get(options, (res) => {
                res.pipe(fs.createWriteStream(dest, {mode: 777}));
                res.on('end', () => resolve(null));
            });
        })
    });

    // Unzip this file and do a cleanup.
    fs.createReadStream(this.zipPath)
        .pipe(unzip.Parse())
        // @ts-ignore
        .on('entry', (entry) => {
            const fileName = entry.path.split('/')[1];

            if (fileName === 'move' || fileName === 'move.exe') {
                entry.pipe(fs.createWriteStream(this.binPath(fileName)));
                entry.on('end', () => fs.chmodSync(this.binPath(fileName), '777'));

            } else {
                entry.autodrain();
            }
        });

    fs.writeFileSync(this.versionPath, version);

    // Do a cleanup
    fs.rmSync(this.zipPath);
}

/**
 * Compare the version file with the latest update from GitHub.
 * Turn semvers into numbers by removing non-digits.
 * 
 * @param this 
 * @param latest 
 * @returns 
 */
function isBinaryOutdated(this: Downloader, latest: string): boolean {
    let version = fs.readFileSync(this.versionPath).toString();

    // Compare versions against each other. If current one is less than new one - update.
    return +version.replace(/[v.]/g, '') < +latest.replace(/[v.]/g, '');
}


/**
 * Check whether the binary exists. 
 * `move` for linux/darwin, `move.exe` for Windows.
 * 
 * @param this 
 * @returns 
 */
function hasBinary(this: Downloader): boolean {
    return fs.existsSync(this.binPath('move'))
        || fs.existsSync(this.binPath('move.exe'));
}


/**
 * Fetch latest release information from GitHub. 
 * 
 * @param this 
 * @returns 
 */
async function checkNewRelease(this: Downloader): Promise<any> {
    const options = {
        host: 'api.github.com',
        path: `/repos/starcoinorg/starcoin/releases/latest`,
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    };
    
    let stats = await new Promise((resolve) => {
        https.get(options, (res) => {
            let body = '';
            res.on('data', (data) => body += data.toString());
            res.on('end', () => resolve(JSON.parse(body)));
        });
    });

    // @ts-ignore
    const latest = stats.tag_name;
    // @ts-ignore 
    // Important! This line searches for a release with "starcoin" and "<PLATFORM>" in its name
    const release = stats.assets.find((a) => a.name.includes(PLATFORM) && a.name.includes('starcoin')) || null;

    if (release !== null) {
        delete release.uploader;
    }

    return {
        latest,
        release
    };
}
