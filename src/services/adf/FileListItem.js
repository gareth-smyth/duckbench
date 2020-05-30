class FileListItem {
    constructor(diskBuffer, buffer, diskConfig) {
        this.diskConfig = diskConfig;
        this.diskBuffer = diskBuffer;
        this.buffer = buffer;
    }

    getNextWithSameHash() {
        const nextWithHash = this.buffer.readUInt32BE(this.diskConfig.BLOCK_SIZE - 16);
        if (nextWithHash) {
            const address = nextWithHash * this.diskConfig.BLOCK_SIZE;
            return FileFactory.build(this.diskBuffer, address, this.diskConfig);
        }
    }

    setNextWithSameHash(fileListItem) {
        this.buffer.writeUInt32BE(fileListItem.getSelf(), this.diskConfig.BLOCK_SIZE - 16);
    }

    getSelf() {
        return this.buffer.readUInt32BE(4);
    }

    addToEndOfHashList(fileListItem) {
        let previousWithSameHash = this;
        let nextWithSameHash = this.getNextWithSameHash();
        while (nextWithSameHash) {
            previousWithSameHash = nextWithSameHash;
            nextWithSameHash = nextWithSameHash.getNextWithSameHash();
        }
        previousWithSameHash.setNextWithSameHash(fileListItem);
    }
}

module.exports = FileListItem;

const FileFactory = require('./FileFactory');
