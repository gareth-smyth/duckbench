const LhaFile = require('./lha/LhaFile.js');

class LhaService {
    static extract(filename, destination) {
        const lhaFile = new LhaFile(filename);
        lhaFile.extract(destination);
    }

    /* This method is for debugging only */
    /* eslint-disable */
    /* istanbul ignore next */
    static info(filename) {
        const lhaFile = new LhaFile(filename);
        lhaFile.parseHeaders();
        console.table(lhaFile.headers, ['filename', 'method', 'compressedFileSize', 'uncompressedFileSize']);
    }
}

module.exports = LhaService;
