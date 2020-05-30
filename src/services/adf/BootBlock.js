const fs = require('fs');
const path = require('path');

const CheckSum = require('./CheckSum');

const BOOT_TYPE = {
    OFS: 0,
    FFS: 1,
    OFS_INTL: 2,
    FFS_INTL: 3,
    OFS_INTL_DIRC: 4,
    FFS_INTL_DIRC: 5,
};

class RootBlock {
    constructor(diskBuffer, diskConfig) {
        this.diskBuffer = diskBuffer;
        this.diskConfig = diskConfig;
        this.buffer = this.diskBuffer.slice(0, this.diskConfig.BLOCK_SIZE * this.diskConfig.BOOT_BLOCKS_RESERVED);
        this.checkSum = new CheckSum(this.buffer, 4, true);
    }

    initialise() {
        this.buffer.write('DOS', 0);
        this.buffer.writeInt8(BOOT_TYPE.FFS, 3);
        this.buffer.writeUInt32BE(this.diskConfig.ROOT_BLOCK, 8);
        this.checkSum.write();
    }

    makeBootable() {
        const bootCode = fs.readFileSync(path.resolve(__dirname, 'bootcode.bin'));
        bootCode.copy(this.buffer, 12, 0, bootCode.length);
        this.checkSum.write();
    }

    isBootable() {
        return this.buffer.readUInt32BE(12) > 0;
    }
}

module.exports = RootBlock;
