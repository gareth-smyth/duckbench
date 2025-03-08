import fs from 'fs';
import path from 'path';
import request from 'request-promise';

export default class AminetService {
    static async download(netPath, filename = path.basename(netPath)) {
        const fullSavePath = path.join(global.CACHE_DIR, filename);
        if (!fs.existsSync(fullSavePath)) {
            global.Logger.debug(`Downloading ${filename} from http://aminet.net/${netPath}`);
            const response = await request({
                uri: `http://aminet.net/${netPath}`,
                resolveWithFullResponse: true,
                encoding: null,
            }).catch((err) => {
                throw new Error(err);
            });
            fs.writeFileSync(fullSavePath, response.body);
        } else {
            global.Logger.debug(`Using cached version of ${filename}`);
        }
        return fullSavePath;
    }
}


