const fs = require('fs');

const LevelBaseSize = {
    '0': 23,
    '1': 26,
};

/**
 * TODO - Handle archives with other header types than "1"
 * TODO - Handle archives with extended headers including folders
 * TODO - Perform CRCs
 */
class LhaHeader {
    constructor(file, offset) {
        const headerBuffer = Buffer.alloc(21, 0);
        fs.readSync(file, headerBuffer, 0, 21, offset);

        this.size = headerBuffer.readUInt8(0);
        this.checksum = headerBuffer.readUInt8(1);
        this.method = headerBuffer.toString('ascii', 2, 7);
        this.compressedFileSize = headerBuffer.readUInt32LE(7);
        this.uncompressedFileSize = headerBuffer.readUInt32LE(11);
        const date = headerBuffer.readUInt32LE(15);
        this.date = this.parseDate(date);
        this.fileAttr = headerBuffer.readUInt8(19);
        this.level = headerBuffer.readUInt8(20);

        if (this.level !== 1) {
            throw new Error(`Could not decode header level ${this.level}`);
        }

        const filenameLengthBuffer = Buffer.alloc(1, 0);
        fs.readSync(file, filenameLengthBuffer, 0, 1, offset + 21);
        this.filenameLength = filenameLengthBuffer.readUInt8(0);

        const levelOneFixedBuffer = Buffer.alloc(this.filenameLength + 5, 0);
        fs.readSync(file, levelOneFixedBuffer, 0, levelOneFixedBuffer.length, offset + 22);
        this.filename = levelOneFixedBuffer.toString('ascii', 0, this.filenameLength);
        this.uncompressedCRC = levelOneFixedBuffer.readUInt16LE(this.filenameLength);
        this.OS = levelOneFixedBuffer.toString('ascii', this.filename.length + 2, this.filename.length + 3);

        this.compressedFileStart = offset + LevelBaseSize[this.level] + this.filenameLength + 1;
        this.endByte = offset + LevelBaseSize[this.level] + this.filenameLength + this.compressedFileSize;
    }

    parseDate(date) {
        const year = date >>> 25 & 0x7f;
        const month = (date >>> 21 & 0xf) - 1;
        const day = date >>> 16 & 0x1f;
        const hour = (date >>> 11 & 0x1f) + 1;
        const minute = date >>> 5 & 0x3f;
        const second = date << 1 & 0x3e;
        return new Date(1980 + year, month, day, hour, minute, second);
    }
}

module.exports = LhaHeader;
