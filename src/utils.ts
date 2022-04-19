export function dos2unix(rootDir:string, grep:string) {
    const globArray = require('glob-array');
    const fs = require('fs');
    const path = require('path');

    const files = globArray.sync([grep], {
        cwd: path.resolve(rootDir)
    });

    files.map((file:any) => {
        const f = path.join(rootDir, file)
        const content = fs.readFileSync(f, 'latin1');
        fs.writeFileSync(f, Buffer.from(content.replace(/\r\n/g, '\n'), 'latin1'));
    });
}