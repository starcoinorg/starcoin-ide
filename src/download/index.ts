import { Downloader, Release } from './commons';
import { MPMDownloader } from './mpm';
import { MoveAnalyzerDownloader } from './move_analyzer';

/**
  * Get current mpm downloader base platform
  * 
  * @param extPath 
  */
function currentDownloader(extPath: string): Downloader {
    return new MPMDownloader(extPath)
}

/**
  * Get current mpm downloader base platform
  * 
  * @param extPath 
  */
function currentAnalyzerDownloader(extPath: string): Downloader {
    return new MoveAnalyzerDownloader(extPath)
}

export {
    Downloader,
    Release,
    currentDownloader,
    currentAnalyzerDownloader,
}