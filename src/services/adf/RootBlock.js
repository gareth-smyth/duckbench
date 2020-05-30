const moment = require('moment');

const CheckSum = require('./CheckSum');
const Directory = require('./Directory');
const Name = require('./Name');
const Timestamp = require('./Timestamp');
const Type = require('./Type');

const BLOCK_TYPE = 2;
const SECONDARY_TYPE_ROOT = 1;
const VALID = -1;

class RootBlock {
    constructor(diskBuffer, diskConfig) {
        this.diskBuffer = diskBuffer;
        this.diskConfig = diskConfig;
        const blockEndAddress = this.diskConfig.ROOT_BLOCK_ADDRESS + this.diskConfig.BLOCK_SIZE;
        this.buffer = diskBuffer.slice(this.diskConfig.ROOT_BLOCK_ADDRESS, blockEndAddress);
        this.checkSum = new CheckSum(this.buffer, 20);

        const lastRootAlterationStart = this.diskConfig.BLOCK_SIZE - 92;
        const lastRootAlterationEnd = this.diskConfig.BLOCK_SIZE - 80;
        this.lastRootAlteration = new Timestamp(this.buffer.slice(lastRootAlterationStart, lastRootAlterationEnd));

        const lastDiskAlterationStart = this.diskConfig.BLOCK_SIZE - 40;
        const lastDiskAlterationEnd = this.diskConfig.BLOCK_SIZE - 28;
        this.lastDiskAlteration = new Timestamp(this.buffer.slice(lastDiskAlterationStart, lastDiskAlterationEnd));

        const fileSystemCreationStart = this.diskConfig.BLOCK_SIZE - 28;
        const fileSystemCreationEnd = this.diskConfig.BLOCK_SIZE - 16;
        this.fileSystemCreation = new Timestamp(this.buffer.slice(fileSystemCreationStart, fileSystemCreationEnd));

        const nameStart = this.diskConfig.BLOCK_SIZE - 80;
        const nameEnd = this.diskConfig.BLOCK_SIZE - 49;
        this.name = new Name(this.buffer.slice(nameStart, nameEnd), this.diskConfig);

        this.type = new Type(this.buffer, this.diskConfig);
        this.directory = new Directory(this.diskBuffer, this.buffer, this.diskConfig);
    }

    format(name) {
        const now = moment.utc();
        this.lastRootAlteration.write(now);
        this.lastDiskAlteration.write(now);
        this.fileSystemCreation.write(now);
        this.name.write(name);
        this.type.write(BLOCK_TYPE, SECONDARY_TYPE_ROOT);

        this.buffer.writeUInt32BE(this.diskConfig.HASH_TABLE_SIZE_LONGS, 12);
        this.buffer.writeInt32BE(VALID, 312);
        this.buffer.writeUInt32BE(this.diskConfig.BITMAP_BLOCK, 316);

        this.checkSum.write();
    }

    findDirectory(path) {
        return this.directory.findDirectory(path);
    }

    getSize() {
        return this.diskConfig.DISK_SIZE_BYTES;
    }

    getName() {
        return this.name.get();
    }
}

module.exports = RootBlock;
