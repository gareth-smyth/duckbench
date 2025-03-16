import fs from "fs";
import path from "path";
import { ChildProcess, spawn } from "child_process";
import SettingsService from "../services/SettingsService.js";
import EnvironmentSetup from "./EnvironmentSetup";
import { Amiga, EmulatorSettings, EmulatorType, Settings } from "../types";
import { buildWinUaeConfig } from "../services/emulator-config/build-win-uae-config";
import { buildFsUaeConfig } from "../services/emulator-config/build-fs-uae-config";
import { buildAmiberryConfig } from "../services/emulator-config/build-amiberry-config";

export default class WinUAEEnvironment {
  private readonly settings;
  private readonly uaeRunningConfig;
  private uaeProcess: ChildProcess | undefined;

  constructor(environment: EnvironmentSetup, settings: Settings) {
    this.settings = settings;

    /* istanbul ignore if @preserve */
    if (!environment.amigaDefinition) {
      throw Error("Could not find an amiga definition");
    }

    const amiga: Amiga = {
      definition: environment.amigaDefinition,
      disks: environment.disks,
    };

    const emulatorSettings: EmulatorSettings = {
      kickstarts: {
        "3.1": SettingsService.getValue(settings, "Setup", "rom310"),
      },
    };

    const emulatorRoot = SettingsService.getValue(
      this.settings,
      "Setup",
      "emulator",
    );
    const emulatorType = this.getEmulatorType(emulatorRoot);
    this.uaeRunningConfig = path.join(environment.executionFolder, "amiga.uae");
    /* istanbul ignore else @preserve */
    if (emulatorType === "WinUAE") {
      const config = buildWinUaeConfig(amiga, emulatorSettings);
      fs.writeFileSync(this.uaeRunningConfig, config);
    } else if (emulatorType === "FS-UAE") {
      const config = buildFsUaeConfig(amiga, emulatorSettings);
      fs.writeFileSync(this.uaeRunningConfig, config);
    } else if (emulatorType === "Amiberry") {
      const config = buildAmiberryConfig(amiga, emulatorSettings);
      fs.writeFileSync(this.uaeRunningConfig, config);
    } else {
      throw Error("Could not find an emulator");
    }
  }

  stop() {
    if (this.uaeProcess) {
      this.uaeProcess.kill();
    }
  }

  private getEmulatorType(emulator: string): EmulatorType | undefined {
    /* istanbul ignore else @preserve */
    if (emulator.toLowerCase().includes("winuae")) {
      return "WinUAE";
    } else if (emulator.toLowerCase().includes("amiberry")) {
      return "Amiberry";
    } else if (emulator.toLowerCase().includes("fs-uae")) {
      return "FS-UAE";
    }

    /* istanbul ignore next @preserve */
    return undefined;
  }

  start() {
    const emulator = SettingsService.getValue(
      this.settings,
      "Setup",
      "emulator",
    );
    this.uaeProcess = spawn(emulator, [
      "-f",
      path.join(this.uaeRunningConfig),
      "-G",
    ]);
  }
}
