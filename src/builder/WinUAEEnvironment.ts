import fs from "fs";
import path from "path";
import { ChildProcess, spawn } from "child_process";
import SettingsService from "../services/SettingsService/SettingsService.js";
import EnvironmentSetup from "./EnvironmentSetup";
import { Amiga, EmulatorSettings, Settings } from "../types";
import { buildConfig } from "../services/emulator-config/build-config";

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
        "3.1": SettingsService.getValue(settings, "Setup", "rom310") as string,
      },
    };

    const emulatorRoot = SettingsService.getValue(
      this.settings,
      "Setup",
      "emulator",
    ) as string;
    const config = buildConfig(amiga, emulatorSettings, emulatorRoot);
    this.uaeRunningConfig = path.join(environment.executionFolder, "amiga.uae");
    fs.writeFileSync(this.uaeRunningConfig, config);
  }

  stop() {
    if (this.uaeProcess) {
      this.uaeProcess.kill();
    }
  }

  start() {
    const emulator = SettingsService.getValue(
      this.settings,
      "Setup",
      "emulator",
    ) as string;
    this.uaeProcess = spawn(emulator, [
      "-f",
      path.join(this.uaeRunningConfig),
      "-G",
    ]);
  }
}
