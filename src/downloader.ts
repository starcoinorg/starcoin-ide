/**
 * Binary downloader for the Starcoin IDE.
 * 
 * @copyright 2021 StarCoin
 */

import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as https from 'https';
import * as wget from 'wget-improved';
import { env } from 'process';

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
export interface Release {
    id: string,
    url: string,
    tag_name: string,
    browser_download_url: string
}

/**
 * GitHub Release information interface.
 */
export interface Downloader {
    executateName: string,
    executateDesc: string,
    latestVersion: string,
    latestStableVersion: string,
    executatePath: string,
    zipPath: string,
    versionPath: string,
    binPath(file: string): string,
    installRelease(version: string, release: Release, progressCallback: (progress:number) => void): Promise<void>,
    checkRelease(version: string): Promise<any>,
    isBinaryOutdated(latest: string): boolean,
    hasBinary(): boolean
}

/**
 * MoveDownloader is a class that handles move binary info fetching, 
 * binary downloads and version comparisons. It operates over the 
 * <extensionPath>/bin folder and stores all the needed information and
 * executables there.
 */
export class MoveDownloader {
    extensionPath: string

    constructor(extPath: string) {
        this.extensionPath = extPath;
    }

    get executateName(): string {
        // @ts-ignore
        const exeName:string = {
            darwin: 'move',
            win32: 'move.exe',
            linux: 'move'
        }[process.platform];

        return exeName;
    }

    get executateDesc(): string {
        return 'move binary'
    }

    get latestVersion(): string {
        return "v1.9.2"
    }

    get latestStableVersion(): string {
        return 'v1.9.0'
    }

    get executatePath(): string {
        return this.binPath(this.executateName);
    }

    get zipPath(): string {
        return this.binPath('fethed.zip');
    }

    get versionPath(): string {
        return this.binPath('.version');
    }

    binPath(file: string): string {
        if (file != "") {
            return path.join(this.extensionPath, 'bin', file);
        } else  {
            return path.join(this.extensionPath, 'bin');
        }
    }
    
    async installRelease(version: string, release: Release, progressCallback: (progress:number) => void): Promise<void> {
        return installRelease(this, version, release, progressCallback);
    }

    async checkRelease(version: string): Promise<any> {
        return checkNewRelease(this, version, 'starcoin')
    }

    isBinaryOutdated(latest: string): boolean {
        return isBinaryOutdated(this, latest);
    }

    hasBinary(): boolean {
        return hasBinary(this);
    }
}

/**
 * MPMDownloader is a class that handles move package manager info fetching, 
 * binary downloads and version comparisons. It operates over the 
 * <extensionPath>/bin folder and stores all the needed information and
 * executables there.
 */
export class MPMDownloader {
    extensionPath: string

    constructor(extPath: string) {
        this.extensionPath = extPath;
    }

    get executateName(): string {
        // @ts-ignore
        const exeName:string = {
            darwin: 'mpm',
            win32: 'mpm.exe',
            linux: 'mpm'
        }[process.platform];

        return exeName;
    }

    get executateDesc(): string {
        return 'move package manager'
    }

    get latestVersion(): string {
        return "latest"
    }

    get latestStableVersion(): string {
        return 'v1.10.0-rc.2'
    }

    get executatePath(): string {
        return this.binPath(this.executateName);
    }

    get zipPath(): string {
        return this.binPath('fethed.zip');
    }

    get versionPath(): string {
        return this.binPath('.version');
    }

    binPath(file: string): string {
        if (file != "") {
            return path.join(this.extensionPath, 'bin', file);
        } else  {
            return path.join(this.extensionPath, 'bin');
        }
    }
    
    async installRelease(version: string, release: Release, progressCallback: (progress:number) => void): Promise<void> {
        return installRelease(this, version, release, progressCallback);
    }

    async checkRelease(version: string): Promise<any> {
        return checkNewRelease(this, version, 'mpm')
    }

    isBinaryOutdated(latest: string): boolean {
        return isBinaryOutdated(this, latest);
    }

    hasBinary(): boolean {
        return hasBinary(this);
    }
}

/**
 * Get current downloader base platform
 * 
 * @param extPath 
 */
export function currentDownloader(extPath: string): Downloader {
    // remove move binary   
    // @ts-ignore
    const loader:Downloader = {
        darwin: new MPMDownloader(extPath),
        win32: new MoveDownloader(extPath),
        linux: new MPMDownloader(extPath)
    }[process.platform];

    return loader
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
async function installRelease(loader: Downloader, version: string, release: Release, progressCallback: (progress:number) => void) {
    var destroy = require('destroy')

    // Create bin dirs
    let binDir = loader.binPath("")
    if (!fs.existsSync(binDir)) {
        fse.mkdirsSync(binDir)
    }

    // Remove the old binaries and the zip archive if there were.
    {
        if (fs.existsSync(loader.zipPath)) {
            fse.rmSync(loader.zipPath);
        }
    };
    
    // Pull the release zip file from the GitHub releases.
    await new Promise((resolve, reject) => {
        let dest = loader.executatePath + ".new";
        if (isZip(release)) {
            dest = loader.zipPath
        }

        let downloader:any = wget.download(release.browser_download_url, dest, {})
            .on('error', function(err) {
                console.log("download error: ", err)
                reject(err)
            })
            .on('timeout', function() {
                console.log("download timeout")
                reject("Network read timeout error")
            })
            .on('start', function(fileSize) {
                if (progressCallback != null) {
                    progressCallback(0)
                }

                // Set network read timeout 20s
                downloader.req.setTimeout(20000, () => {
                    downloader.req.abort()
                    console.log("download timeout")
                    reject("Network read timeout error")
                });
            })
            .on('end', function(output) {
                resolve(null)
            })
            .on('progress', function(progress) {
                if (progressCallback != null) {
                    progressCallback(progress)
                }
            })
    });

    if (isZip(release)) {
        // Unzip this file and do a cleanup.
        let rs = fs.createReadStream(loader.zipPath)

        try {
            await new Promise((resolve, reject) => {
                rs.pipe(unzip.Parse())
                // @ts-ignore
                .on('entry', (entry) => {
                    const fileName = entry.path.split('/')[1];

                    if (fileName === loader.executateName) {
                        let dest = loader.executatePath + ".new"
                        entry.pipe(fs.createWriteStream(dest));
                        entry.on('end', () => fs.chmodSync(dest, '777'));
                        entry.on('error', reject);
                    } else {
                        entry.autodrain();
                    }
                })
                .on('close', resolve)
                .on('error', reject);
            });
        } finally {
            destroy(rs)
        }

        // Do a cleanup
        fse.rmSync(loader.zipPath);
    }

    // Remove old executate
    if (fs.existsSync(loader.executatePath)) {
        fse.rmSync(loader.executatePath)
    }

    // Update with new executate
    fse.renameSync(loader.executatePath + ".new", loader.executatePath)
    fse.chmodSync(loader.executatePath, '777')
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
function isBinaryOutdated(loader: Downloader, latest: string): boolean {
    var compareVersions = require('node-version-compare');
    let version = fs.readFileSync(loader.versionPath).toString();

    // Compare versions against each other. If current one is less than new one - update.
    return compareVersions(version, latest) < 0
}


/**
 * Check release whether is zip file
 * 
 * @param release 
 * @returns 
 */
function isZip(release: Release): boolean {
    return release.browser_download_url.endsWith(".zip")
}

/**
 * Check whether the binary exists. 
 * `move` for linux/darwin, `move.exe` for Windows.
 * 
 * @param loader 
 * @returns 
 */
function hasBinary(loader: Downloader): boolean {
    return fs.existsSync(loader.executatePath);
}

/**
 * Fetch latest release information from GitHub. 
 * 
 * @param loader 
 * @returns 
 */
async function checkNewRelease(loader: Downloader, version:string, name: string): Promise<any> {
    const options = {
        host: 'api.github.com',
        path: `/repos/starcoinorg/starcoin/releases/tags/` + version,
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    };
    
    let githubToken = env.GITHUB_TOKEN
    if (githubToken) {
        // @ts-ignore
        options.headers["authorization"] = "Bearer " + githubToken
    }

    if (version == "latest") {
        options.path = `/repos/starcoinorg/starcoin/releases/latest`
    }

    let stats = await new Promise((resolve, reject) => {
        https.get(options, (res) => {
            let body = '';
            res.on('data', (data) => body += data.toString());
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
        throw new Error("Release not found")
    }

    if (release !== null) {
        delete release.uploader;
    }

    return {
        tag: latest,
        release: release
    };
}
