const fs = require('fs');

class IFFReader {
    read(filename) {
        const file = fs.readFileSync(filename);
        filetype = file.toString()
    }
}

module.exports = IFFReader;
