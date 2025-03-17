import fs from "fs";
import path from "path";

import RomFinderService from "../../services/RomFinderService.js";
import Logger from "../../services/LoggerService.js";

export default class SetupSettings {
  get() {
    return {
      name: "Setup",
      label: "Setup",
      settings: [
        {
          name: "emulator",
          type: "hostFile",
          label: "Emulator executable",
          hasDefaultSearch: true,
        },
        {
          name: "rom310",
          type: "hostFile",
          label: "Kickstart 3.1",
          hasDefaultSearch: true,
        },
        {
          name: "outputLocation",
          type: "hostFolder",
          label: "Output location",
        },
        {
          name: "outputConfig",
          type: "boolean",
          label: "Output location",
        },
      ],
    };
  }

  default(settingName: "emulator" | "rom310") {
    switch (settingName) {
      case "emulator":
        return this.findEmulator();
      case "rom310":
        return this.findRom310();
    }
  }

  findEmulator() {
    Logger.trace("Looking for an emulator");
    if (process.env.DUCKBENCH_EMU) {
      Logger.trace("Found an emulator using environment vars.");
      return `${process.env.DUCKBENCH_EMU}/WinUAE.exe`;
    } else if (fs.existsSync("C:/Program Files/WinUAE")) {
      Logger.trace('Found WinUAE at "C:/Program Files/WinUAE".');
      return "C:/Program Files/WinUAE/WinUAE64.exe";
    } else if (fs.existsSync("C:/Program Files (x86)/WinUAE")) {
      Logger.trace('Found WinUAE at "C:/Program Files (x86)/WinUAE".');
      return "C:/Program Files (x86)/WinUAE/WinUAE.exe";
    } else if (fs.existsSync("/Applications/Amiberry.app")) {
      Logger.trace('Found Amiberry at "/Applications".');
      return "/Applications/Amiberry.app/Contents/MacOS/Amiberry";
    } else if (fs.existsSync("/Applications/FS-UAE.app")) {
      Logger.trace('Found FS-UAE at "/Applications".');
      return "/Applications/FS-UAE.app/Contents/MacOS/FS-UAE";
    } else {
      Logger.trace("Emulator not found");
      return {};
    }
  }

  findRom310() {
    Logger.trace("Looking for ROMs");
    if (process.env.DUCKBENCH_ROMS) {
      Logger.trace("Found rom paths using environment vars... setting config");
      return RomFinderService.find("3.1", process.env.DUCKBENCH_ROMS);
    } else if (process.env.AMIGAFOREVERDATA) {
      Logger.trace(
        "Found rom paths using Amiga Forever environment vars... setting config",
      );
      return RomFinderService.find(
        "3.1",
        path.join(process.env.AMIGAFOREVERDATA, "Shared", "rom"),
      );
    } else {
      Logger.trace(
        "Cannot find required paths. Either AMIGAFOREVERDATA should be set, " +
          `or DUCKBENCH_ROMS.
    AMIGAFOREVERDATA: "${process.env.AMIGAFOREVERDATA}",
    DUCKBENCH_ROMS: "${process.env.DUCKBENCH_ROMS}"`,
      );
      return {};
    }
  }
}
