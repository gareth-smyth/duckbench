const fs = require('fs');

class Partition {
    read(file, blockPointer, hardDriveConfig) {
        this.hardDriveConfig = hardDriveConfig;
        this.buffer = Buffer.alloc(256, 0);
        this.blockPointer = blockPointer;
        fs.readSync(file, this.buffer, 0, this.buffer.length, blockPointer * this.hardDriveConfig.blockSize);
    }

    write(hardDriveConfig, file) {
        fs.writeSync(file, this.buffer, 0, this.buffer.length, this.blockPointer * hardDriveConfig.blockSize);
    }

    create(hardDriveConfig, partitionDefinition) {
        this.buffer = Buffer.alloc(256, 0);
        this.blockPointer = partitionDefinition.blockPtr;
        this.setId('PART');
        this.setStructureSize(64);
        this.setHostId(7);
        this.setNextPartitionBlock(partitionDefinition.nextPartitionBlockPtr);
        this.setFlags(1);
        this.setDriveName(partitionDefinition.driveName);
        this.setDosEnvVectorSize(16);
        this.setBlockSizeLongs(hardDriveConfig.blockSize / 4);
        this.setHeads(hardDriveConfig.heads);
        this.setSectorsPerBlock(1);
        this.setBlocksPerTrack(hardDriveConfig.blocksPerCylinder / hardDriveConfig.heads);
        this.setDosReservedBlocks(2);
        this.setStartCylinder(partitionDefinition.startCylinder);
        this.setEndCylinder(partitionDefinition.endCylinder);
        this.setBuffers(30);
        this.setMaxTransfer(0x1FE00);
        this.setMask(0x7FFFFFFE);
        this.setDosType(partitionDefinition.dosType);
        this.setCheckSum();
    }

    checkSum() {
        let sum = 0;
        for (let bufferIndex = 0; bufferIndex < this.buffer.length; bufferIndex += 4) {
            sum += this.buffer.readInt32BE(bufferIndex);
        }
        return (-sum) & 0xffffffff;
    }

    setHeads(heads) {
        this.buffer.writeUInt32BE(heads, 140);
    }

    setSectorsPerBlock(sectorsPerBlock) {
        this.buffer.writeUInt32BE(sectorsPerBlock, 144);
    }

    setBlocksPerTrack(blocksPerTrack) {
        this.buffer.writeUInt32BE(blocksPerTrack, 148);
    }

    setDosReservedBlocks(reservedBlocks) {
        this.buffer.writeUInt32BE(reservedBlocks, 152);
    }

    setMask(mask) {
        this.buffer.writeUInt32BE(mask, 184);
    }

    setMaxTransfer(maxTransfer) {
        this.buffer.writeUInt32BE(maxTransfer, 180);
    }

    setBuffers(buffers) {
        this.buffer.writeUInt32BE(buffers, 172);
    }

    setBlockSizeLongs(blockSizeLongs) {
        this.buffer.writeUInt32BE(blockSizeLongs, 132);
    }

    setDosEnvVectorSize(dosEnvVectorSize) {
        this.buffer.writeUInt32BE(dosEnvVectorSize, 128);
    }

    // Bit0: Bootable, Bit1: No Automount
    setFlags(flags) {
        this.buffer.writeUInt32BE(flags, 20);
    }

    setHostId(hostId) {
        this.buffer.writeUInt32BE(hostId, 12);
    }

    setId(id) {
        this.buffer.write(id, 0);
    }

    setStructureSize(size) {
        this.buffer.writeUInt32BE(size, 4);
    }

    setCheckSum() {
        this.buffer.writeInt32BE(this.checkSum(), 8);
    }

    setNextPartitionBlock(nextPartitionBlock) {
        this.buffer.writeUInt32BE(nextPartitionBlock, 16);
    }

    getNextPartitionBlock() {
        return this.buffer.readInt32BE(16);
    }

    getDriveName() {
        const driveNameLength = this.buffer.readUInt8(36);
        return this.buffer.toString('ASCII', 37, 37 + driveNameLength);
    }

    setDriveName(driveName) {
        this.buffer.writeUInt8(driveName.length, 36);
        return this.buffer.write(driveName, 37, driveName.length);
    }

    getStartCylinder() {
        return this.buffer.readUInt32BE(164);
    }

    setStartCylinder(cylinder) {
        return this.buffer.writeUInt32BE(cylinder, 164);
    }

    getEndCylinder() {
        return this.buffer.readUInt32BE(168);
    }

    setEndCylinder(cylinder) {
        return this.buffer.writeUInt32BE(cylinder, 168);
    }

    getDosType() {
        const dosTypeNum = this.buffer.readUInt8(195);
        return this.buffer.toString('utf8', 192, 195) + dosTypeNum;
    }

    setDosType(dosType) {
        return this.buffer.writeUInt32BE(dosType, 192);
    }

    getSize() {
        return (this.getEndCylinder() - this.getStartCylinder() + 1) *
            this.hardDriveConfig.blocksPerCylinder * this.hardDriveConfig.blockSize;
    }
}

module.exports = Partition;
