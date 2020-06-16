class HardDriveConfig {
    constructor(byteSize, heads, sectors, blockSize, reservedCylinders, reservedBlocks) {
        this.byteSize = byteSize;
        this.cylinders = byteSize / blockSize / sectors / heads;
        this.heads = heads;
        this.sectors = sectors;
        this.blockSize = blockSize;
        this.reservedCylinders = reservedCylinders;
        this.reservedBlocks = reservedBlocks;
        this.blocksPerCylinder = heads * sectors;
    }
}

module.exports = HardDriveConfig;
