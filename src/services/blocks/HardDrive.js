const fs = require('fs');
const HardDriveConfig = require('./HardDriveConfig');
const Partition = require('./Partition');
const RigidDiskBlock = require('./RigidDiskBlock');

class HardDrive {
    read(diskFile) {
        this.fileDescriptor = fs.openSync(diskFile, 'r');
        this.size = fs.statSync(diskFile).size;
        this.rigidDiskBlock = new RigidDiskBlock(this.fileDescriptor);
        this.diskConfig = new HardDriveConfig(
            this.rigidDiskBlock.getCylinders(),
            this.rigidDiskBlock.getHeads(),
            this.rigidDiskBlock.getSectors(),
            this.rigidDiskBlock.getBlockSize(),
            this.rigidDiskBlock.getPartitionableLowCylinder(),
            this.rigidDiskBlock.getRDBHighBlock());
    }

    create(hardDriveConfig) {
        this.rigidDiskBlock = new RigidDiskBlock();
        this.rigidDiskBlock.initialise(hardDriveConfig);
        this.partitions = [];
    }

    partition(hardDriveConfig, partitionDefinitions) {
        partitionDefinitions.forEach((partitionDefinition) => {
            const newPartition = new Partition();
            newPartition.create(hardDriveConfig, partitionDefinition);
            this.partitions.push(newPartition);
        });
    }

    save(hardDriveConfig, diskFile) {
        const fileDescriptor = fs.openSync(diskFile, 'w+');

        fs.writeSync(fileDescriptor, Buffer.alloc(1), 0, 1, hardDriveConfig.byteSize - 1);
        this.rigidDiskBlock.write(fileDescriptor);
        this.partitions.forEach((partition) => {
            partition.write(hardDriveConfig, fileDescriptor);
        });
        fs.closeSync(fileDescriptor);
    }

    getPartitions() {
        const partitions = [];
        let partitionPointer = this.rigidDiskBlock.getFirstPartitionPointer();
        while (partitionPointer > 0) {
            const partition = new Partition();
            partition.read(this.fileDescriptor, partitionPointer, this.diskConfig);
            partitions.push(partition);
            partitionPointer = partition.getNext();
        }
        return partitions;
    }

    info() {
        return {
            'Size': `${this.size / 1024 / 1024} MB`,
            'Block size': this.rigidDiskBlock.getBlockSize(),
            'Flags': this.rigidDiskBlock.getFlags().toString(2),
            'Cylinders': this.rigidDiskBlock.getCylinders(),
            'Sectors': this.rigidDiskBlock.getSectors(),
            'Heads': this.rigidDiskBlock.getHeads(),
            'Park': this.rigidDiskBlock.getParkCylinder(),
            'B per C': this.rigidDiskBlock.getBlocksPerCylinder(),

        };
    }

    partitionInfo() {
        return this.getPartitions().map((partition) => {
            return {
                'Drive name': partition.getDriveName(),
                'File system': partition.getDosType(),
                'Start Cylinder': partition.getStartCylinder(),
                'End Cylinder': partition.getEndCylinder(),
                'Size': `${partition.getSize() / 1024 / 1024} MB`,
            };
        });
    }
}

module.exports = HardDrive;
