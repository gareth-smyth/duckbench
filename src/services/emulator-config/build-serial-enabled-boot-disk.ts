import path from "path";
import Logger from "../LoggerService";
import ADFService from "../ADFService";

export function buildSerialEnabledBootDisk(bootDiskFileName: string) {
  Logger.info(`Creating boot disk at ${bootDiskFileName}`);
  ADFService.createBootableADF(bootDiskFileName, "SerialBoot");
  ADFService.createFile(
    bootDiskFileName,
    "AUX",
    path.join(import.meta.dirname, "amigaFiles/file_AUX"),
  );
  ADFService.createDirectory(bootDiskFileName, "", "s");
  ADFService.createDirectory(bootDiskFileName, "", "t");
  const startupSequenceFile = path.join(
    import.meta.dirname,
    "amigaFiles/s/file_startup-sequence",
  );
  ADFService.createFile(
    bootDiskFileName,
    "s/startup-sequence",
    startupSequenceFile,
  );
}
