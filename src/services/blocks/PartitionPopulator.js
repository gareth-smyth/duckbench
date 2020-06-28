const FileSystemDosTypeMap = {
    ffs: '0x444F5303',
    pfs: '0x50445303',
};

class PartitionPopulator {
    static populate(partitions, hardDriveConfig) {
        const reservedCylinders = hardDriveConfig.reservedCylinders;
        let partitionStart = reservedCylinders;
        let currentPartitionBlock = 1;
        const totalSizeMb = partitions.reduce((total, partition) => total + partition.size, 0);
        return partitions.map((partition, partitionIndex) => {
            partition.blockPtr = currentPartitionBlock;
            currentPartitionBlock += 1;

            partition.nextPartitionBlockPtr = this.getNextPartitionBlock(partitionIndex, partitions, reservedCylinders);

            partition.startCylinder = partitionStart;

            const availableHardDriveCylinders = hardDriveConfig.cylinders - reservedCylinders;
            partition.endCylinder = Math.min(
                partitionStart + Math.floor(partition.size / totalSizeMb * availableHardDriveCylinders),
                hardDriveConfig.cylinders - 1,
            );

            partition.dosType = FileSystemDosTypeMap[partition.fileSystem];

            partitionStart = partition.endCylinder + 1;
            return partition;
        });
    }

    static getNextPartitionBlock(partitionIndex, partitions) {
        return (partitionIndex === (partitions.length - 1)) ? 0xFFFFFFFF : 2 + partitionIndex;
    }
}

module.exports = PartitionPopulator;
