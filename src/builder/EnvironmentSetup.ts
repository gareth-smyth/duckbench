import fs from "fs";
import path from "path";
import { BASE_DIR } from "../services/BaseDirService";
import { DiskDefinition, DiskSetup } from "../types";

export default class EnvironmentSetup {
  readonly disks: DiskSetup = { ADF: [], CD: [], HDF: [], MAPPED_DRIVE: [] };
  executionFolder: string;
  systemName: string = "";
  rom: string = "";
  cpu: string = "";
  chipMem: string = "";
  fastMem: string = "";
  floppyDrive: boolean = true;

  constructor() {
    const executionNumber = new Date().toISOString().replace(/[^0-9]/g, "");
    this.executionFolder = path.join(BASE_DIR, "execution", executionNumber);

    if (!fs.existsSync(path.join(BASE_DIR, "execution"))) {
      fs.mkdirSync(path.join(BASE_DIR, "execution"));
    }

    fs.mkdirSync(this.executionFolder);
  }

  setSystemName(systemName: string) {
    this.systemName = systemName;
  }

  setRom(rom: string) {
    this.rom = rom;
  }

  setCPU(cpu: string) {
    this.cpu = cpu;
  }

  // UnADF requires an 020
  getCPU() {
    return Math.max(Number(this.cpu), 68020).toString();
  }

  setChipMem(chipMem: string) {
    this.chipMem = chipMem;
  }

  setFastMem(fastMem: string) {
    this.fastMem = fastMem;
  }

  setFloppyDrive(floppyDrive: boolean) {
    this.floppyDrive = floppyDrive;
  }

  insertCDISO(location: string) {
    this.disks.CD.push({ location });
  }

  insertDisk(drive: string, diskDefinition: DiskDefinition) {
    const startLocation = diskDefinition.location;
    const location = path.join(this.executionFolder, drive + ".adf");
    fs.copyFileSync(startLocation, location);
    fs.chmodSync(location, 0o0666);

    this.disks.ADF.push({ drive, location });
  }

  attachHDF(drive: string, location: string) {
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
    fs.rmdirSync(this.executionFolder, { recursive: true });
  }
}
