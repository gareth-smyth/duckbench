const fs = require('fs');
const path = require('path');
const AminetService = require('../AminetService');
const LhaService = require('../LhaService');

const FileSystemDosTypeMap = {
    pfs: {dosType: '0x50445303', version: 0x00130002},
};

class FileSystemPopulator {
    static async getFileSystemConfigs(blockSize, partitions) {
        const fileSystemConfigs = [];
        for (let partitionIndex = 0; partitionIndex < partitions.length; partitionIndex++) {
            const partition = partitions[partitionIndex];
            if (partition.fileSystem !== 'ffs' && !this.fileSystemAlreadyAdded(fileSystemConfigs, partition)) {
                const fileSystemConfig = await this.getFileSystemConfig(partition.fileSystem, blockSize);
                fileSystemConfigs.push(fileSystemConfig);
            }
        }
        return fileSystemConfigs;
    }

    static populate(fileSystemConfigs, partitions) {
        let totalSegListBlocks = 0;
        const endHeaderBlock = 1 + partitions.length + fileSystemConfigs.length;
        const firstFileSystemHeaderBlock = 1 + partitions.length;
        return fileSystemConfigs.map((fileSystemConfig, fileSystemIndex) => {
            fileSystemConfig.firstSegListBlock = endHeaderBlock + totalSegListBlocks;
            fileSystemConfig.nextFileSystemBlock =
                this.getNextFileSystemBlock(fileSystemIndex, fileSystemConfigs, partitions);
            fileSystemConfig.blockPtr = firstFileSystemHeaderBlock + fileSystemIndex;
            fileSystemConfig.fileSystemBinary = fs.readFileSync(fileSystemConfig.fileSystemPath);

            totalSegListBlocks = totalSegListBlocks + fileSystemConfig.reservedBlocks;

            return fileSystemConfig;
        });
    }

    static getNextFileSystemBlock(fileSystemIndex, fileSystemConfigs, partitions) {
        const nextPartitionBlock = 2 + partitions.length + fileSystemIndex;

        /* We can only ever have one filesystem here at the minute - PFS */
        /* istanbul ignore next */
        return (fileSystemIndex === (fileSystemConfigs.length - 1)) ? 0xFFFFFFFF : nextPartitionBlock;
    }

    static fileSystemAlreadyAdded(fileSystemConfigs, partition) {
        return fileSystemConfigs.find(((fileSystemConfig) => fileSystemConfig.fileSystemType === partition.fileSystem));
    }

    static async getFileSystemConfig(fileSystemType, blockSize) {
        if (fileSystemType === 'pfs') {
            const downloadPath = await AminetService.download('disk/misc/pfs3aio.lha');
            LhaService.extract(downloadPath, global.CACHE_DIR);

            const fileSystemPath = path.join(global.CACHE_DIR, 'pfs3aio');

            const stats = fs.statSync(fileSystemPath);
            const fileSize = stats.size;
            const reservedBlocks = Math.ceil(fileSize / (blockSize - 20));

            const dosType = FileSystemDosTypeMap[fileSystemType].dosType;
            const version = FileSystemDosTypeMap[fileSystemType].version;

            return {fileSystemPath, reservedBlocks, dosType, version, fileSystemType};
        } else {
            throw new Error('Can not install the selected file system');
        }
    }
}

module.exports = FileSystemPopulator;
