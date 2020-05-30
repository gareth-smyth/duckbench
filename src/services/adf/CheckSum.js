class CheckSum {
    constructor(buffer, offset, fixed = false) {
        this.buffer = buffer;
        this.offset = offset;
        this.method = fixed ? this._getBootCheckSum : this._getCheckSum;
    }

    write() {
        this.buffer.writeInt32BE(0, this.offset);
        this.buffer.writeInt32BE(this.method(), this.offset);
    }

    _getBootCheckSum() {
        let sum = 0;
        for (let bufferIndex = 0; bufferIndex < this.buffer.length; bufferIndex += 4) {
            sum += this.buffer.readUInt32BE(bufferIndex);
            if (sum > 0xffffffff) {
                sum += 1;
                sum = (sum & 0xffffffff) >>> 0;
            }
        }
        return ((~sum) & 0xffffffff);
    }

    _getCheckSum() {
        let sum = 0;
        for (let bufferIndex = 0; bufferIndex < this.buffer.length; bufferIndex += 4) {
            sum += this.buffer.readInt32BE(bufferIndex);
        }
        return (-sum) & 0xffffffff;
    }
}

module.exports = CheckSum;
