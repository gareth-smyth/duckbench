import fs from "fs";
import path from "path";
import { ChildProcess, spawn } from "child_process";
import SettingsService from "../services/SettingsService.js";
import EnvironmentSetup from "./EnvironmentSetup";
import { DiskSetup, Settings } from "../types";

export default class WinUAEEnvironment {
  private readonly settings;
  private readonly uaeRunningConfig;
  private winuaeProcess: ChildProcess | undefined;

  constructor(environment: EnvironmentSetup, settings: Settings) {
    this.settings = settings;

    this.uaeRunningConfig = path.join(environment.executionFolder, "amiga.uae");
    const configFile = fs.openSync(this.uaeRunningConfig, "w");

    fs.writeSync(configFile, "use_gui=no\n");
    fs.writeSync(configFile, "// headless=true\n");
    fs.writeSync(configFile, "use_debugger=true\n");
    fs.writeSync(configFile, "win32.serial_port=TCP://0.0.0.0:8552\n");
    fs.writeSync(configFile, "serial_direct=true\n");
    fs.writeSync(configFile, "serial_translate=disabled\n");

    const romFile = SettingsService.getValue(settings, "Setup", "rom310");
    fs.writeSync(configFile, `kickstart_rom_file=${romFile.file}\n`);
    fs.writeSync(
      configFile,
      `cpu_type=${this.getCPUType(environment.getCPU())}\n`,
    );
    const cpuModel = this.getCPUModel(environment.getCPU());
    if (cpuModel) {
      fs.writeSync(configFile, `cpu_model=${cpuModel}\n`);
    }

    fs.writeSync(
      configFile,
      `chipmem_size=${Number(environment.chipMem) * 2}\n`,
    );
    fs.writeSync(configFile, `z3mem_size=${environment.fastMem}\n`);
    fs.writeSync(configFile, "floppy_speed=0\n");
    fs.writeSync(configFile, "cpu_speed=max\n");
    fs.writeSync(configFile, "chipset=aga\n");

    this.writeDiskConfig(configFile, environment.disks);

    fs.closeSync(configFile);
  }

  writeDiskConfig(configFile: number, disks: DiskSetup) {
    disks.ADF.forEach((disk, diskNum) => {
      fs.writeSync(configFile, `floppy${diskNum}=${disk}\n`);
    });

    let diskIdx = 0;
    disks.HDF.forEach((disk) => {
      const hardfileLine = `hardfile2=rw,${disk.drive}:${disk.location},0,0,0,512,0,,uae${diskIdx}\n`;
      const hfLine = `uaehf${diskIdx}=hdf,rw,${disk.drive}:${disk.location},0,0,0,512,0,,uae${diskIdx}\n`;
      fs.writeSync(configFile, hardfileLine);
      fs.writeSync(configFile, hfLine);
      diskIdx += 1;
    });

    disks.MAPPED_DRIVE.forEach((disk) => {
      const readWrite = disk.writeable ? "rw" : "ro";
      fs.writeSync(
        configFile,
        `filesystem2=${readWrite},${disk.drive}:${disk.name}:${disk.location},-128\n`,
      );
      fs.writeSync(
        configFile,
        `uaehf${diskIdx}=dir,${readWrite},${disk.drive}:${disk.name}:${disk.location},-128\n`,
      );
      diskIdx += 1;
    });

    if (disks.CD.length) {
      fs.writeSync(configFile, "win32.map_cd_drives=true\n");
      disks.CD.forEach((disk, cdIdx) => {
        fs.writeSync(configFile, `cdimage${cdIdx}=${disk.location}\n`);
      });
    }
  }

  getCPUType(cpu: string) {
    if (cpu === "68030") {
      return "68020";
    } else {
      return cpu;
    }
  }

  getCPUModel(cpu: string) {
    if (cpu === "68030") {
      return "68030";
    }
    return;
  }

  stop() {
    if (this.winuaeProcess) {
      this.winuaeProcess.kill();
    }
  }

  start() {
    const emulatorRoot = SettingsService.getValue(
      this.settings,
      "Setup",
      "emulatorRoot",
    );
    const path32 = path.join(emulatorRoot.folder, "WinUAE.exe");
    const path64 = path.join(emulatorRoot.folder, "WinUAE64.exe");
    const pathMacFsUAE = path.join(
      emulatorRoot.folder,
      "FS-UAE.app/Contents/MacOS/FS-UAE",
    );
    const executablePath = fs.existsSync(path32)
      ? path32
      : fs.existsSync(path64)
        ? path64
        : pathMacFsUAE;
    this.winuaeProcess = spawn(executablePath, [
      "-f",
      path.join(this.uaeRunningConfig),
    ]);
  }
}
