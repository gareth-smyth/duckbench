const fs = require('fs');

const RIGID_DISK_BLOCK_SIZE = 256;

class RigidDiskBlock {
    constructor(file) {
        this.buffer = Buffer.alloc(RIGID_DISK_BLOCK_SIZE, 0);
        if (file) {
            fs.readSync(file, this.buffer, 0, this.buffer.length, 0);
        }
    }

    write(file) {
        fs.writeSync(file, this.buffer, 0, this.buffer.length, 0);
    }

    initialise(config, partitionConfig, fileSystemConfigs) {
        this.buffer.write('RDSK', 0);
        this.setRigidDiskBlockSize();
        this.setHostId();
        this.setBlockSize(config.blockSize);
        this.setFlags(18);
        this.setFirstBadBlockPointer(-1);
        this.setFirstPartitionPointer(1);
        this.setFirstFileSystemPointer(fileSystemConfigs.length ? partitionConfig.length + 1 : -1);
        this.buffer.writeUInt32BE(0xFFFFFFFF, 40);
        this.buffer.writeUInt32BE(0xFFFFFFFF, 44);
        this.buffer.writeUInt32BE(0xFFFFFFFF, 48);
        this.buffer.writeUInt32BE(0xFFFFFFFF, 52);
        this.buffer.writeUInt32BE(0xFFFFFFFF, 56);
        this.buffer.writeUInt32BE(0xFFFFFFFF, 60);
        this.setDriveInitCode(-1);
        this.setCylinders(config.cylinders);
        this.setSectors(config.sectors);
        this.setHeads(config.heads);
        this.setInterleave(1);
        this.setParkCylinder(config.cylinders);
        this.setWritePreCompCylinder(config.cylinders);
        this.setReducedWriteCylinder(config.cylinders);
        this.setStepRate(3);
        this.setLowBlockRange(0);
        this.setHighBlockRange(config.blocksPerCylinder * config.reservedCylinders - 1);
        this.setPartitionableLowCylinder(config.reservedCylinders);
        this.setPartitionableHighCylinder(config.cylinders - 1);
        this.setBlocksPerCylinder(config.blocksPerCylinder);
        this.setRDBHighBlock(config.reservedBlocks);
        this.setVendor('DBENCH');
        this.setProduct('HDFTOOL');
        this.setRevision('0001');
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

    getBlocksPerCylinder() {
        return this.buffer.readUInt32BE(144);
    }

    setBlocksPerCylinder(blocksPerCylinder) {
        this.buffer.writeUInt32BE(blocksPerCylinder, 144);
    }

    getBlockSize() {
        return this.buffer.readUInt32BE(16);
    }

    setBlockSize(blockSize) {
        this.buffer.writeUInt32BE(blockSize, 16);
    }

    getCylinders() {
        return this.buffer.readUInt32BE(64);
    }

    setCylinders(cylinders) {
        this.buffer.writeUInt32BE(cylinders, 64);
    }

    setDriveInitCode(block) {
        this.buffer.writeInt32BE(block, 36);
    }

    setReducedWriteCylinder(cylinder) {
        this.buffer.writeUInt32BE(cylinder, 100);
    }

    setFirstBadBlockPointer(block) {
        this.buffer.writeInt32BE(block, 24);
    }

    getFirstFileSystemPointer() {
        return this.buffer.readInt32BE(32);
    }

    setFirstFileSystemPointer(block) {
        this.buffer.writeInt32BE(block, 32);
    }

    getFirstPartitionPointer() {
        return this.buffer.readInt32BE(28);
    }

    setFirstPartitionPointer(block) {
        this.buffer.writeInt32BE(block, 28);
    }

    getFlags() {
        return this.buffer.readUInt32BE(20);
    }

    setFlags(flags) {
        this.buffer.writeUInt32BE(flags, 20);
    }

    getHeads() {
        return this.buffer.readUInt32BE(72);
    }

    setHeads(heads) {
        this.buffer.writeUInt32BE(heads, 72);
    }

    setHighBlockRange(range) {
        this.buffer.writeUInt32BE(range, 132);
    }

    setHostId() {
        this.buffer.writeUInt32BE(7, 12);
    }

    setInterleave(interleave) {
        this.buffer.writeUInt32BE(interleave, 76);
    }

    setLowBlockRange(range) {
        this.buffer.writeUInt32BE(range, 128);
    }

    getParkCylinder() {
        return this.buffer.readUInt32BE(80);
    }

    setParkCylinder(cylinder) {
        this.buffer.writeUInt32BE(cylinder, 80);
    }

    setPartitionableHighCylinder(cylinder) {
        this.buffer.writeUInt32BE(cylinder, 140);
    }

    getPartitionableLowCylinder() {
        return this.buffer.readUInt32BE(136);
    }

    setPartitionableLowCylinder(cylinder) {
        this.buffer.writeUInt32BE(cylinder, 136);
    }

    setProduct(product) {
        this.buffer.write(product, 168);
    }

    setRigidDiskBlockSize() {
        this.buffer.writeUInt32BE(RIGID_DISK_BLOCK_SIZE / 4, 4);
    }

    getRDBHighBlock() {
        return this.buffer.readUInt32BE(152);
    }

    setRDBHighBlock(block) {
        this.buffer.writeUInt32BE(block, 152);
    }

    setRevision(revision) {
        this.buffer.write(revision, 184);
    }

    getSectors() {
        return this.buffer.readUInt32BE(68);
    }

    setSectors(sectors) {
        this.buffer.writeUInt32BE(sectors, 68);
    }

    setWritePreCompCylinder(cylinder) {
        this.buffer.writeUInt32BE(cylinder, 96);
    }

    setStepRate(stepRate) {
        this.buffer.writeUInt32BE(stepRate, 104);
    }

    setVendor(vendor) {
        this.buffer.write(vendor, 160);
    }
}

module.exports = RigidDiskBlock;
