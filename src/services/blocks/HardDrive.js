const fs = require('fs');
const FileSystem = require('./FileSystem');
const FileSystemSegList = require('./FileSystemSegList');
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

    create(hardDriveConfig, fileSystemConfigs, populatedFileSystems) {
        this.rigidDiskBlock = new RigidDiskBlock();
        this.rigidDiskBlock.initialise(hardDriveConfig, fileSystemConfigs, populatedFileSystems);
        this.partitions = [];
        this.fileSystems = [];
        this.fileSystemSegLists = [];
    }

    partition(hardDriveConfig, partitionDefinitions) {
        partitionDefinitions.forEach((partitionDefinition) => {
            const newPartition = new Partition();
            newPartition.create(hardDriveConfig, partitionDefinition);
            this.partitions.push(newPartition);
        });
    }

    addFileSystems(hardDriveConfig, fileSystemConfigs) {
        fileSystemConfigs.forEach((fileSystemConfig) => {
            const newFileSystem = new FileSystem();
            newFileSystem.create(hardDriveConfig, fileSystemConfig);
            this.fileSystems.push(newFileSystem);
        });
    }

    addFileSystemSegLists(hardDriveConfig, fileSystemConfigs) {
        fileSystemConfigs.forEach((fileSystemConfig) => {
            const newFileSystemSegList = new FileSystemSegList();
            newFileSystemSegList.create(hardDriveConfig, fileSystemConfig);
            this.fileSystemSegLists.push(newFileSystemSegList);
        });
    }

    save(hardDriveConfig, diskFile) {
        const fileDescriptor = fs.openSync(diskFile, 'w+');

        fs.writeSync(fileDescriptor, Buffer.alloc(1), 0, 1, hardDriveConfig.byteSize - 1);
        this.rigidDiskBlock.write(fileDescriptor);
        this.partitions.forEach((partition) => {
            partition.write(hardDriveConfig, fileDescriptor);
        });
        this.fileSystems.forEach((fileSystem) => {
            fileSystem.write(hardDriveConfig, fileDescriptor);
        });
        this.fileSystemSegLists.forEach((fileSystemLoadSegList) => {
            fileSystemLoadSegList.write(hardDriveConfig, fileDescriptor);
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
            partitionPointer = partition.getNextPartitionBlock();
        }
        return partitions;
    }

    getFileSystems() {
        const fileSystems = [];
        let fileSystemPointer = this.rigidDiskBlock.getFirstFileSystemPointer();
        while (fileSystemPointer > 0) {
            const fileSystem = new FileSystem();
            fileSystem.read(this.fileDescriptor, fileSystemPointer, this.diskConfig);

            const firstSegListBlock = fileSystem.getFirstSegListBlock();

            const segList = new FileSystemSegList();
            segList.read(this.fileDescriptor, firstSegListBlock, this.diskConfig);
            fileSystem.numberOfLoadSegs = segList.buffers.length;

            fileSystems.push(fileSystem);

            fileSystemPointer = fileSystem.getNextFileSystemBlock();
        }
        return fileSystems;
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

    fileSystemInfo() {
        return this.getFileSystems().map((fileSystem) => {
            return {
                'File system': fileSystem.getDosType(),
                'Version': fileSystem.getVersion(),
                'Number of LoadSegs': fileSystem.numberOfLoadSegs,
            };
        });
    }
}

module.exports = HardDrive;
