import * as fs from 'fs'
import * as path from 'path'

/**
* create dirs
* 
* @param dirname dir path 
* @returns 
*/
export function mkdirsSync(dirname: string) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
   }
}