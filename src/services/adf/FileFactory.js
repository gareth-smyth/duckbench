const BLOCK_SIZE = 512;

class FileFactory {
    static build(diskBuffer, address, diskConfig) {
        this.diskConfig = diskConfig;
        const block = diskBuffer.slice(address, address + BLOCK_SIZE);
        const type = new Type(block, this.diskConfig);
        if (type.getSecondary() === -3) {
            return new File(diskBuffer, block, this.diskConfig);
        }
        return new Directory(diskBuffer, block, this.diskConfig);
    }
}

module.exports = FileFactory;

const Directory = require('./Directory');
const Type = require('./Type');
const File = require('./File');
