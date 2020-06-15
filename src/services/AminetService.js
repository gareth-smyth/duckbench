const fs = require('fs');
const path = require('path');
const request = require('request-promise');

class AminetService {
    static async download(netPath, filename = path.basename(netPath)) {
        const fullSavePath = path.join(global.CACHE_DIR, filename);
        if (!fs.existsSync(fullSavePath)) {
            Logger.debug(`Downloading ${filename} from http://aminet.net/${netPath}`);
            const response = await request({
                uri: `http://aminet.net/${netPath}`,
                resolveWithFullResponse: true,
                encoding: null,
            }).catch((err) => {
                throw new Error(err);
            });
            fs.writeFileSync(fullSavePath, response.body);
        } else {
            Logger.debug(`Using cached version of ${filename}`);
        }
    }
}

module.exports = AminetService;
