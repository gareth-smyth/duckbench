class DiskConfig {
    constructor(cylinders, heads, sectors, blockSize, bootBlocksReserved) {
        this.CYLINDERS = cylinders;
        this.HEADS = heads;
        this.SECTORS = sectors;
        this.BLOCK_SIZE = blockSize;
        this.BOOT_BLOCKS_RESERVED = bootBlocksReserved;
        this.DISK_BLOCKS = this.CYLINDERS * this.HEADS * this.SECTORS;
        this.DISK_SIZE_BYTES = this.DISK_BLOCKS * this.BLOCK_SIZE;
        this.ROOT_BLOCK = this.DISK_BLOCKS / 2;
        this.ROOT_BLOCK_ADDRESS = this.ROOT_BLOCK * this.BLOCK_SIZE;
        this.BITMAP_BLOCK = this.ROOT_BLOCK + 1;
        this.BITMAP_BLOCK_ADDRESS = this.BITMAP_BLOCK * this.BLOCK_SIZE;
        this.HASH_TABLE_SIZE_LONGS = this.BLOCK_SIZE / 4 - 56;
    }
}

module.exports = DiskConfig;
