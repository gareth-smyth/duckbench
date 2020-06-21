class HardDriveConfig {
    constructor(byteSize, heads, sectors, blockSize, reservedBlocks) {
        this.byteSize = byteSize;
        this.cylinders = Math.floor(byteSize / blockSize / sectors / heads);
        this.heads = heads;
        this.sectors = sectors;
        this.blockSize = blockSize;
        this.blocksPerCylinder = heads * sectors;
        this.reservedCylinders = Math.ceil(reservedBlocks / this.blocksPerCylinder);
        this.reservedBlocks = reservedBlocks;
    }
}

module.exports = HardDriveConfig;
