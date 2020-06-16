const HardDrive = require('./blocks/HardDrive');
const HardDriveConfig = require('./blocks/HardDriveConfig');
const PartitionPopulator = require('./blocks/PartitionPopulator');

const ONE_MEGABYTE = 0x100000;

class HardDriveService {
    static info(filename) {
        const hardDrive = new HardDrive();
        hardDrive.read(filename);

        const info = hardDrive.info();
        const partitionInfo = hardDrive.partitionInfo();

        return {info, partitionInfo};
    }

    static createRDB(filename, size, partitions) {
        const byteSize = size * ONE_MEGABYTE;
        const hardDrive = new HardDrive();

        const config = new HardDriveConfig(byteSize, 1, 32, 512, 1, 1 + partitions.length);
        const populatedPartitions = PartitionPopulator.populate(partitions, config);

        hardDrive.create(config);
        hardDrive.partition(config, populatedPartitions);
        hardDrive.save(config, filename);
    }
}

// (async () => {
//     HardDriveService.info('../../../../pfs_uninit.hdf');
// })();

// (async () => {
//     HardDriveService.createRDB('../../testfile.hdf', 10, [{driveName: 'DH0'}, {driveName: 'DH1'}]);
//     HardDriveService.info('../../testfile.hdf');
// })();

module.exports = HardDriveService;
