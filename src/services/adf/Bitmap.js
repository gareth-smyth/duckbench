const CheckSum = require('./CheckSum');

class Bitmap {
    constructor(diskBuffer, diskConfig) {
        this.diskConfig = diskConfig;

        const startAddress = this.diskConfig.BITMAP_BLOCK_ADDRESS;
        const endAddress = startAddress + this.diskConfig.BLOCK_SIZE;
        this.buffer = diskBuffer.slice(startAddress, endAddress);

        this.checkSum = new CheckSum(this.buffer, 0);
    }

    format() {
        this.buffer.fill(0xFF);
        this.buffer.writeUInt32BE(0, 0);

        this.unsetBitmap(this.diskConfig.ROOT_BLOCK);
        this.unsetBitmap(this.diskConfig.BITMAP_BLOCK);

        this.checkSum.write();
    }

    unsetBitmap(block) {
        const blockOffset = block - this.diskConfig.BOOT_BLOCKS_RESERVED;
        const offset = Math.floor(blockOffset / 32);
        const bitmask = ~(1 << blockOffset % 32);
        this.buffer.writeInt32BE(this.buffer.readUInt32BE((offset + 1) * 4) & bitmask, (offset + 1) * 4);
        this.checkSum.write();
    }

    getBitmapSet(block) {
        const blockOffset = block - this.diskConfig.BOOT_BLOCKS_RESERVED;
        const offset = Math.floor(blockOffset / 32);
        const bitmask = 1 << (blockOffset % 32);
        return (this.buffer.readUInt32BE((offset + 1) * 4) & bitmask) !== bitmask;
    }

    getFreeBlock() {
        let block = this.diskConfig.ROOT_BLOCK;
        let blockVal = this.getBitmapSet(block);
        while (blockVal) {
            block += 1;
            if (block >= this.diskConfig.DISK_BLOCKS) {
                block = 3;
            } else if (block === this.diskConfig.ROOT_BLOCK) {
                block = -1;
                break;
            }
            blockVal = this.getBitmapSet(block);
        }

        if (block > -1) {
            this.unsetBitmap(block);
        } else {
            throw Error('Could not allocate free block');
        }

        return block;
    }
}

module.exports = Bitmap;
