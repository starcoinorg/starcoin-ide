import * as path from 'path';
import { Release, installRelease, checkNewRelease, isBinaryOutdated, hasBinary } from './commons';

/**
 * MoveAnalyzerDownloader is a class that handles move-analyzer binary info fetching,
 * binary downloads and version comparisons. It operates over the
 * <extensionPath>/bin folder and stores all the needed information and
 * executables there.
 */
export class MoveAnalyzerDownloader {
  extensionPath: string;

  constructor(extPath: string) {
    this.extensionPath = extPath;
  }

  get executateName(): string {
    // @ts-ignore
    const exeName: string = {
      darwin: 'move-analyzer',
      win32: 'move-analyzer.exe',
      linux: 'move-analyzer'
    }[process.platform];

    return exeName;
  }

  get executateDesc(): string {
    return 'move-analyzer binary';
  }

  get latestVersion(): string {
    return 'v0.3.0';
  }

  get latestStableVersion(): string {
    return 'v0.2.3';
  }

  get executatePath(): string {
    return this.binPath(this.executateName);
  }

  get zipPath(): string {
    return this.binPath('move-fethed.zip');
  }

  get versionPath(): string {
    return this.binPath('move.version');
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
    return checkNewRelease(this, 'starcoinorg/move', version, 'move');
  }

  isBinaryOutdated(latest: string): boolean {
    return isBinaryOutdated(this, latest);
  }

  hasBinary(): boolean {
    return hasBinary(this);
  }
}
