import { existsSync } from "fs";
import path from "path";

import SystemDiskService from "../../services/SystemDiskService";
import Logger from "../../services/LoggerService";
import { CACHE_DIR } from "../../services/BaseDirService";

export default class Settings {
  private readonly identifier = "3.2";
  private readonly name = "InstallWorkbench320";
  private readonly cacheName = "wb320_cached";
  private readonly readableName = "Workbench 3.2";
  private readonly disks = [
    { name: "install", label: "Install disk" },
    { name: "workbench", label: "Workbench disk" },
    { name: "locale", label: "Locale disk" },
    { name: "locale-EN", label: "Locale-EN disk" },
    { name: "fonts", label: "Fonts disk" },
    { name: "extras", label: "Extras disk" },
    { name: "storage", label: "Storage disk" },
    { name: "diskdoctor", label: "Disk doctor" },
    { name: "classes", label: "Classes disk" },
    { name: "backdrops", label: "Backdrops disk" },
    { name: "modules1200", label: "A1200 Modules" },
  ];

  get() {
    const cacheMarkerPath = path.join(CACHE_DIR, this.cacheName);
    return {
      name: this.name,
      label: this.readableName,
      settings: this.disks.map((disk) => {
        return {
          name: disk.name,
          type: "hostFile",
          label: disk.label,
          hasDefaultSearch: true,
          cached: existsSync(cacheMarkerPath),
        };
      }),
    };
  }

  async default(settingName: string) {
    Logger.trace(`Looking for ${this.readableName} disks`);
    if (process.env.DUCKBENCH_DISKS) {
      Logger.trace("Found disk path using environment var...");
      return SystemDiskService.find(
        this.identifier,
        settingName,
        process.env.DUCKBENCH_DISKS,
      );
    } else if (process.env.AMIGAFOREVERDATA) {
      Logger.trace("Found disk paths using Amiga Forever environment var...");
      const diskPath = path.join(process.env.AMIGAFOREVERDATA, "Shared", "adf");
      return SystemDiskService.find(this.identifier, settingName, diskPath);
    } else {
      Logger.trace(
        "Cannot find required path. Either AMIGAFOREVERDATA or DUCKBENCH_DISKS shoule be set. " +
          'AMIGAFOREVERDATA: "${process.env.AMIGAFOREVERDATA}", ' +
          'DUCKBENCH_DISKS: "${process.env.DUCKBENCH_DISKS}"',
      );
      return {};
    }
  }
}
