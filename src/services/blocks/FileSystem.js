const fs = require('fs');

class FileSystem {
    read(file, blockPointer, hardDriveConfig) {
        this.hardDriveConfig = hardDriveConfig;
        this.buffer = Buffer.alloc(256, 0);
        this.blockPointer = blockPointer;
        fs.readSync(file, this.buffer, 0, this.buffer.length, blockPointer * this.hardDriveConfig.blockSize);
    }

    write(hardDriveConfig, file) {
        fs.writeSync(file, this.buffer, 0, this.buffer.length, this.blockPointer * hardDriveConfig.blockSize);
    }

    create(hardDriveConfig, fileSystemDefinition) {
        this.buffer = Buffer.alloc(256, 0);
        this.blockPointer = fileSystemDefinition.blockPtr;
        this.setId('FSHD');
        this.setStructureSize(64);
        this.setHostId(7);
        this.setPatchFlags(0x180);
        this.setNextFileSystemBlock(fileSystemDefinition.nextFileSystemBlock);
        this.setDosType(fileSystemDefinition.dosType);
        this.setVersion(fileSystemDefinition.version);
        this.setFirstSegListBlock(fileSystemDefinition.firstSegListBlock);
        this.setGlobalVec(0xFFFFFFFF);
        this.setCheckSum();
    }

    checkSum() {
        let sum = 0;
        for (let bufferIndex = 0; bufferIndex < this.buffer.length; bufferIndex += 4) {
            sum += this.buffer.readInt32BE(bufferIndex);
        }
        return (-sum) & 0xffffffff;
    }

    setCheckSum() {
        this.buffer.writeInt32BE(this.checkSum(), 8);
    }

    setHostId(hostId) {
        this.buffer.writeUInt32BE(hostId, 12);
    }

    setPatchFlags(patchFlags) {
        this.buffer.writeUInt32BE(patchFlags, 40);
    }

    setId(id) {
        this.buffer.write(id, 0);
    }

    setStructureSize(size) {
        this.buffer.writeUInt32BE(size, 4);
    }

    setNextFileSystemBlock(nextFileSystemBlock) {
        this.buffer.writeUInt32BE(nextFileSystemBlock, 16);
    }

    setFirstSegListBlock(firstSegListBlock) {
        this.buffer.writeUInt32BE(firstSegListBlock, 72);
    }

    getFirstSegListBlock() {
        return this.buffer.readUInt32BE(72);
    }

    setGlobalVec(globalVec) {
        this.buffer.writeUInt32BE(globalVec, 76);
    }

    setDosType(dosType) {
        return this.buffer.writeUInt32BE(dosType, 32);
    }

    setVersion(version) {
        return this.buffer.writeUInt32BE(version, 36);
    }

    getNextFileSystemBlock() {
        return this.buffer.readInt32BE(16);
    }

    getDosType() {
        const dosTypeNum = this.buffer.readUInt8(35);
        return this.buffer.toString('utf8', 32, 35) + dosTypeNum;
    }

    getVersion() {
        const highVersion = this.buffer.readUInt16BE(36);
        const lowVersion = this.buffer.readUInt16BE(38);
        return `${highVersion}.${lowVersion}`;
    }
}

module.exports = FileSystem;
