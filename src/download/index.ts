import { Downloader, Release } from './commons';
import { MoveDownloader } from './move';
import { MPMDownloader } from './mpm';

/**
  * Get current downloader base platform
  * 
  * @param extPath 
  */
function currentDownloader(extPath: string): Downloader {
    // remove move binary   
    // @ts-ignore
    const loader: Downloader = {
        darwin: new MPMDownloader(extPath),
        win32: new MPMDownloader(extPath),
        linux: new MPMDownloader(extPath)
    }[process.platform];

    return loader
}

export {
    Downloader,
    Release,
    currentDownloader,
    MoveDownloader,
    MPMDownloader
}