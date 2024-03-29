import * as path from 'path';
import { Release, installRelease, checkNewRelease, isBinaryOutdated, hasBinary } from './commons';

/**
 * MPMDownloader is a class that handles move package manager info fetching,
 * binary downloads and version comparisons. It operates over the
 * <extensionPath>/bin folder and stores all the needed information and
 * executables there.
 */
export class MPMDownloader {
  extensionPath: string;

  constructor(extPath: string) {
    this.extensionPath = extPath;
  }

  get executateName(): string {
    // @ts-ignore
    const exeName: string = {
      darwin: 'mpm',
      win32: 'mpm.exe',
      linux: 'mpm'
    }[process.platform];

    return exeName;
  }

  get executateDesc(): string {
    return 'move package manager';
  }

  get latestVersion(): string {
    return 'v1.12.6-alpha';
  }

  get latestStableVersion(): string {
    return 'v1.11.10';
  }

  get executatePath(): string {
    return this.binPath(this.executateName);
  }

  get zipPath(): string {
    return this.binPath('starcoin-fethed.zip');
  }

  get versionPath(): string {
    return this.binPath('starcoin.version');
  }

  binPath(file: string): string {
    if (file !== '') {
      return path.join(this.extensionPath, 'bin', file);
    } else {
      return path.join(this.extensionPath, 'bin');
    }
  }

  async installRelease(version: string, release: Release, progressCallback: (progress: number) => void): Promise<void> {
    return installRelease(this, version, release, progressCallback);
  }

  async checkRelease(version: string): Promise<any> {
    return checkNewRelease(this, 'starcoinorg/starcoin', version, 'mpm');
  }

  isBinaryOutdated(latest: string): boolean {
    return isBinaryOutdated(this, latest);
  }

  hasBinary(): boolean {
    return hasBinary(this);
  }
}
