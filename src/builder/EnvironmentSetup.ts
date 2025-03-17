import path from "path";
import { BASE_DIR } from "../services/BaseDirService";
import { AmigaDefinition, DiskSetup } from "../types";
import { copyFileSync, existsSync, mkdirSync, rmdirSync, chmodSync } from "fs";

export default class EnvironmentSetup {
  disks: DiskSetup = { ADF: [], HDF: [], MAPPED_DRIVE: [], CD: [] };
  executionFolder: string;
  amigaDefinition?: AmigaDefinition;

  constructor() {
    const executionNumber = new Date().toISOString().replace(/[^0-9]/g, "");
    this.executionFolder = path.join(BASE_DIR, "execution", executionNumber);

    if (!existsSync(path.join(BASE_DIR, "execution"))) {
      mkdirSync(path.join(BASE_DIR, "execution"));
    }

    mkdirSync(this.executionFolder);
  }

  insertCDISO(location: string) {
    this.disks.CD.push(location);
  }

  insertDisk(drive: string, fileLocation: string) {
    const location = path.join(this.executionFolder, drive + ".adf");
    copyFileSync(fileLocation, location);
    chmodSync(location, 0o0777);

    this.disks.ADF.push(location);
  }

  attachHDF(drive: string, location: string) {
    chmodSync(location, 0o0777);
    this.disks.HDF.push({ drive, location });
  }

  mapFolderToDrive(
    drive: string,
    location: string,
    name: string,
    writeable = false,
  ) {
    this.disks.MAPPED_DRIVE.push({ drive, location, name, writeable });
  }

  destroy() {
    rmdirSync(this.executionFolder, { recursive: true });
  }
}
