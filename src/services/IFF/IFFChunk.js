class IFFChunk {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        this.selfSize = 8;
    }

    getDataSize() {
        return this.data.length;
    }

    getPaddedSize() {
        // istanbul ignore next -- Need to fashion a more complex test file.
        if (this.getDataSize() % 2 !== 0) {
            return this.getDataSize() + this.selfSize + 1;
        }

        return this.getDataSize() + this.selfSize;
    }

    write(buffer, initialPosition) {
        buffer.write(this.type, initialPosition);
        buffer.writeUInt32BE(this.getPaddedSize() - this.selfSize, initialPosition + 4);
        this.data.copy(buffer, initialPosition + this.selfSize);
    }
}

module.exports = IFFChunk;
