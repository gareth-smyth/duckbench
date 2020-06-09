/* eslint-disable no-use-before-define */
const Bitmap = require('./Bitmap');
const CheckSum = require('./CheckSum');
const Name = require('./Name');
const Type = require('./Type');

const BLOCK_TYPE = 2;
const SECONDARY_TYPE_FILE = -3;

class File {
    constructor(diskBuffer, buffer, diskConfig) {
        this.diskConfig = diskConfig;
        this.diskBuffer = diskBuffer;
        this.buffer = buffer;

        const nameStart = this.diskConfig.BLOCK_SIZE - 80;
        const nameEnd = this.diskConfig.BLOCK_SIZE - 49;
        this.name = new Name(this.buffer.slice(nameStart, nameEnd), this.diskConfig);

        this.diskBitmap = new Bitmap(this.diskBuffer, this.diskConfig);
        this.fileListItem = new FileListItem(diskBuffer, this.buffer, this.diskConfig);
        this.type = new Type(this.buffer, this.diskConfig);
        this.checkSum = new CheckSum(this.buffer, 20);
    }

    initialise(block, name, parent) {
        this.name.set(name);
        this.type.write(BLOCK_TYPE, SECONDARY_TYPE_FILE);
        this.buffer.writeUInt32BE(block, 4); // Self
        this.buffer.writeUInt32BE(parent || this.diskConfig.ROOT_BLOCK, this.diskConfig.BLOCK_SIZE - 12);
        this.checkSum.write();
    }

    writeContent(content) {
        const numberOfBlocks = Math.floor(content.length / this.diskConfig.BLOCK_SIZE);
        let firstFreeBlock = 0;
        for (let blockIndex = 0; blockIndex <= numberOfBlocks; blockIndex++) {
            const freeBlock = this.diskBitmap.getFreeBlock();
            firstFreeBlock = firstFreeBlock || freeBlock;
            const freeBlockAddress = freeBlock * this.diskConfig.BLOCK_SIZE;
            this.buffer.writeUInt32BE(freeBlock, this.diskConfig.BLOCK_SIZE - (204 + blockIndex * 4));
            const blockStart = blockIndex * this.diskConfig.BLOCK_SIZE;
            const blockEnd = (blockIndex + 1) * this.diskConfig.BLOCK_SIZE;
            content.copy(this.diskBuffer, freeBlockAddress, blockStart, blockEnd);
        }
        this.buffer.writeUInt32BE(numberOfBlocks + 1, 8);
        this.buffer.writeUInt32BE(firstFreeBlock, 16);
        this.buffer.writeUInt32BE(content.length, this.diskConfig.BLOCK_SIZE - 188);
        this.checkSum.write();
    }

    getName() {
        return this.name;
    }

    addToEndOfHashList(fileListItem) {
        this.fileListItem.addToEndOfHashList(fileListItem);
        this.checkSum.write();
    }

    getSelf() {
        return this.fileListItem.getSelf();
    }

    getNextWithSameHash() {
        return this.fileListItem.getNextWithSameHash();
    }

    setNextWithSameHash(next) {
        return this.fileListItem.setNextWithSameHash(next);
    }
}

module.exports = File;

const FileListItem = require('./FileListItem');
