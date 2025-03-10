import HardDrive from "./blocks/HardDrive.js";
import HardDriveConfig from "./blocks/HardDriveConfig.js";
import PartitionPopulator from "./blocks/PartitionPopulator.js";
import FileSystemPopulator from "./blocks/FileSystemPopulator.js";

const ONE_MEGABYTE = 0x100000;

export default class HardDriveService {
  static info(filename) {
    const hardDrive = new HardDrive();
    hardDrive.read(filename);

    const info = hardDrive.info();
    const partitionInfo = hardDrive.partitionInfo();
    const fileSystemInfo = hardDrive.fileSystemInfo();

    return { info, partitionInfo, fileSystemInfo };
  }

  static async createRDB(filename, size, partitions) {
    const byteSize = size * ONE_MEGABYTE;
    const blockSize = 512;
    const hardDrive = new HardDrive();

    const fileSystemConfigs = await FileSystemPopulator.getFileSystemConfigs(
      blockSize,
      partitions,
    );
    const loadSegBlocks = fileSystemConfigs.reduce(
      (totalBlocks, fileSystemConfig) => {
        return totalBlocks + fileSystemConfig.reservedBlocks;
      },
      0,
    );

    const reservedBlocks =
      loadSegBlocks + fileSystemConfigs.length + partitions.length + 1;
    const hardDriveConfig = new HardDriveConfig(
      byteSize,
      16,
      63,
      blockSize,
      reservedBlocks,
    );

    const populatedPartitions = PartitionPopulator.populate(
      partitions,
      hardDriveConfig,
    );
    const populatedFileSystems = FileSystemPopulator.populate(
      fileSystemConfigs,
      partitions,
    );

    hardDrive.create(
      hardDriveConfig,
      populatedPartitions,
      populatedFileSystems,
    );
    hardDrive.partition(hardDriveConfig, populatedPartitions);
    hardDrive.addFileSystems(hardDriveConfig, populatedFileSystems);
    hardDrive.addFileSystemSegLists(hardDriveConfig, populatedFileSystems);
    hardDrive.save(hardDriveConfig, filename);
  }
}
