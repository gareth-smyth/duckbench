class Type {
    constructor(buffer, diskConfig) {
        this.diskConfig = diskConfig;
        this.buffer = buffer;
    }

    write(type, secondaryType) {
        this.buffer.writeInt32BE(type, 0);
        this.buffer.writeInt32BE(secondaryType, this.diskConfig.BLOCK_SIZE - 4);
    }

    getSecondary() {
        return this.buffer.readInt32BE(this.diskConfig.BLOCK_SIZE - 4);
    }
}

module.exports = Type;
