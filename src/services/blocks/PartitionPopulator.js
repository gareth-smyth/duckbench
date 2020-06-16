class PartitionPopulator {
    static populate(partitions, hardDriveConfig) {
        const reservedCylinders = hardDriveConfig.reservedCylinders;
        let partitionStart = reservedCylinders;
        let currentPartitionBlock = 1;
        return partitions.map((partition, partitionIndex) => {
            partition.blockPtr = currentPartitionBlock;
            currentPartitionBlock += 1;

            partition.nextPartitionBlockPtr = this.getNextPartitionBlock(partitionIndex, partitions, reservedCylinders);

            partition.startCylinder = partitionStart;

            const availableHardDriveCylinders = hardDriveConfig.cylinders - reservedCylinders;
            partition.endCylinder = partitionStart + Math.floor(availableHardDriveCylinders / partitions.length);

            partitionStart = partition.endCylinder + 1;
            return partition;
        });
    }

    static getNextPartitionBlock(partitionIndex, partitions) {
        return (partitionIndex === (partitions.length - 1)) ? 0xFFFFFFFF : 2 + partitionIndex;
    }
}

module.exports = PartitionPopulator;
