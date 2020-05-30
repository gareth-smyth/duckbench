/* istanbul ignore file - Ignored as this service is due to be completely rewritten to allow PFS */
const fs = require('fs');

const RDB_CONSTANTS = {
    rigidDiskBlockSize: 256,
    hostId: 7,
    flags: 7,
    badBlocks: 4294967295,
    partitions: 1,
    fileSysHeaders: 4294967295,
    driveInit: 4294967295,
    interleave: 1,
    stepRate: 3,
    highBlockRange: 31,
    blocksPerCylinder: 32,
    vendor: 'RDBTOOL',
    product: 'IMAGE',
    rev: '2012',
    sectors: 32,
    blockSize: 512,
    heads: 1,
};

const PARTITION_CONSTANTS = {
    partitionSize: 256,
    hostId: 7,
    nextPartition: 4294967295,
};

class RDBService {
    static createRDB(file, size, drive) {
        const rdbFile = fs.openSync(file, 'w');
        const byteSize = size * 1048576;

        this.create(rdbFile, byteSize);
        this.initialise(rdbFile, byteSize);
        this.partition(rdbFile, drive, byteSize);

        fs.closeSync(rdbFile);
    }

    static create(file, byteSize) {
        fs.writeSync(file, Buffer.alloc(1), 0, 1, byteSize - 1);
    }

    static initialise(file, byteSize) {
        const cylinders = byteSize / RDB_CONSTANTS.blockSize / RDB_CONSTANTS.sectors / RDB_CONSTANTS.heads;
        const park = cylinders;
        const startCylinder = cylinders;
        const endCylinder = cylinders;
        const partitionTableLowCylinder = 1;
        const partitionTableHighCylinder = cylinders - 1;
        const diskBlockSizeLongs = RDB_CONSTANTS.rigidDiskBlockSize / 4;

        const rigidDiskBlock = Buffer.alloc(RDB_CONSTANTS.rigidDiskBlockSize, 0);

        rigidDiskBlock.write('RDSK', 0);
        rigidDiskBlock.writeUInt32BE(diskBlockSizeLongs, 4);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.hostId, 12);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.blockSize, 16);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.flags, 20);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.badBlocks, 24);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.partitions, 28); // Should be FFFFFF until partition added
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.fileSysHeaders, 32);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.driveInit, 36);
        rigidDiskBlock.writeUInt32BE(cylinders, 64);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.sectors, 68);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.heads, 72);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.interleave, 76);
        rigidDiskBlock.writeUInt32BE(park, 80);
        rigidDiskBlock.writeUInt32BE(startCylinder, 96);
        rigidDiskBlock.writeUInt32BE(endCylinder, 100);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.stepRate, 104);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.highBlockRange, 132);
        rigidDiskBlock.writeUInt32BE(partitionTableLowCylinder, 136);
        rigidDiskBlock.writeUInt32BE(partitionTableHighCylinder, 140);
        rigidDiskBlock.writeUInt32BE(RDB_CONSTANTS.blocksPerCylinder, 144);
        rigidDiskBlock.writeUInt32BE(1, 152); // should be zero until partition added
        rigidDiskBlock.write(RDB_CONSTANTS.vendor, 160);
        rigidDiskBlock.write(RDB_CONSTANTS.product, 168);
        rigidDiskBlock.write(RDB_CONSTANTS.rev, 184);

        rigidDiskBlock.writeInt32BE(this.getCheckSum(rigidDiskBlock), 8);

        fs.writeSync(file, rigidDiskBlock, 0, RDB_CONSTANTS.rigidDiskBlockSize, 0);
    }

    static partition(file, drive, byteSize) {
        const cylinders = byteSize / RDB_CONSTANTS.blockSize / RDB_CONSTANTS.sectors / RDB_CONSTANTS.heads;
        const partitionSizeLongs = PARTITION_CONSTANTS.partitionSize / 4;

        const partition = Buffer.alloc(PARTITION_CONSTANTS.partitionSize, 0);

        partition.write('PART', 0);
        partition.writeUInt32BE(partitionSizeLongs, 4);
        partition.writeUInt32BE(PARTITION_CONSTANTS.hostId, 12);
        partition.writeUInt32BE(PARTITION_CONSTANTS.nextPartition, 16);
        partition.writeUInt32BE(1, 20);
        partition.writeUInt8(drive.length, 36);
        partition.write(drive, 37);
        partition.writeUInt32BE(16, 128); // Env length (not including this long)
        partition.writeUInt32BE(RDB_CONSTANTS.blockSize / 4, 132); // Size block
        partition.writeUInt32BE(RDB_CONSTANTS.heads, 140); // surfaces
        partition.writeUInt32BE(1, 144); // sectors per block
        partition.writeUInt32BE(32, 148); // blocks per track
        partition.writeUInt32BE(2, 152); // dos reserved
        partition.writeUInt32BE(1, 164); // start cylinder
        partition.writeUInt32BE(cylinders - 1, 168); // end cylinder
        partition.writeUInt32BE(30, 172); // buffers
        partition.writeUInt32BE(0x1FE00, 180); // max transfer
        partition.writeUInt32BE(0x7FFFFE, 184); // mask
        partition.writeUInt32BE(0x444F5303, 192); // dos type

        partition.writeInt32BE(this.getCheckSum(partition), 8);

        fs.writeSync(file, partition, 0, PARTITION_CONSTANTS.partitionSize, 512);
    }

    static getCheckSum(buffer) {
        let sum = 0;
        for (let bufferIndex = 0; bufferIndex < buffer.length; bufferIndex += 4) {
            sum += buffer.readInt32BE(bufferIndex);
        }
        return (-sum) & 0xffffffff;
    }
}

module.exports = RDBService;
