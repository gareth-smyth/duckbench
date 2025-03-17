import { copyFileSync, writeFileSync, existsSync } from "node:fs";
import path from "path";
import ADFService from "../../services/ADFService.js";
import HardDriveService from "../../services/HardDriveService.js";
import SettingsService from "../../services/SettingsService/SettingsService.js";
import Logger from "../../services/LoggerService.js";
import { CACHE_DIR, TOOLS_DIR } from "../../services/BaseDirService.js";
import {
  Amiga,
  AmigaDefinition,
  EmulatorSettings,
  Plugin,
  PluginConfig,
  Settings,
} from "../../types";
import EnvironmentSetup from "../../builder/EnvironmentSetup";
import Communicator from "../../builder/Communicator";
import PluginStore from "../../builder/PluginStore";
import RedirectInputFile from "../RedirectInputFile";
import { buildConfig } from "../../services/emulator-config/build-config";
import { Amiga1200 } from "../../amigas";

export type SetupPluginConfig = PluginConfig & {
  type: "internal";
  name: "Setup";
};

export default class Setup implements Plugin<SetupPluginConfig> {
  structure() {
    return {
      name: "Setup",
      type: "internal",
    };
  }

  validate(
    config: SetupPluginConfig,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
  ) {
    const validationErrors = [];
    const workbenchADFFileName = SettingsService.getValue(
      settings,
      "InstallWorkbench310",
      "workbench",
    ) as string;
    if (!workbenchADFFileName) {
      validationErrors.push({
        type: "error",
        text: "Workbench 3.1 ADF could not be found",
      });
    } else if (!existsSync(workbenchADFFileName)) {
      const errorText = `Workbench 3.1 ADF could not be found at ${workbenchADFFileName}`;
      validationErrors.push({ type: "error", text: errorText });
    }

    const emulatorPath = SettingsService.getValue(
      settings,
      "Setup",
      "emulator",
    ) as string;
    if (!emulatorPath) {
      validationErrors.push({
        type: "error",
        text: "Path to emulator is not set",
      });
    } else {
      if (!existsSync(emulatorPath)) {
        validationErrors.push({
          type: "error",
          text: `Could not find emulator executable at ${emulatorPath}`,
        });
      }
    }

    const rom310File = SettingsService.getValue(
      settings,
      "Setup",
      "rom310",
    ) as string;
    if (!rom310File) {
      validationErrors.push({
        type: "error",
        text: "Path to 310 rom file is not set",
      });
    } else if (!existsSync(rom310File)) {
      validationErrors.push({
        type: "error",
        text: `Could not find 310 ROM file at ${rom310File}`,
      });
    }

    return validationErrors;
  }

  async prepare(
    config: SetupPluginConfig,
    environmentSetup: EnvironmentSetup,
    settings?: Settings,
  ) {
    const bootDiskFileName = path.join(
      environmentSetup.executionFolder,
      "boot.adf",
    );
    Logger.info(`Creating boot disk at ${bootDiskFileName}`);
    ADFService.createBootableADF(bootDiskFileName, "DuckBoot");
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

    Logger.debug("Inserting boot disk in DF0 and workbench disk in DF1.");
    environmentSetup.insertDisk("DF0", bootDiskFileName);
    environmentSetup.insertDisk(
      "DF1",
      SettingsService.getValue(
        settings!,
        "InstallWorkbench310",
        "workbench",
      ) as string,
    );

    Logger.debug(`Mapping DB5: as DB_HOST_CACHE: at ${CACHE_DIR}`);
    environmentSetup.mapFolderToDrive("DB5", CACHE_DIR, "DB_HOST_CACHE");

    Logger.debug(`Mapping DB4: as DB_TOOLS: at ${TOOLS_DIR}`);
    environmentSetup.mapFolderToDrive("DB4", TOOLS_DIR, "DB_TOOLS");

    Logger.debug(
      `Mapping DB2: as DB_EXECUTION: at ${environmentSetup.executionFolder}`,
    );
    environmentSetup.mapFolderToDrive(
      "DB2",
      environmentSetup.executionFolder,
      "DB_EXECUTION",
      true,
    );

    const cacheLocation = path.join(CACHE_DIR, "client_cache.hdf");
    if (!existsSync(cacheLocation)) {
      Logger.debug("Creating DB1: as DB_CLIENT_CACHE: as new HDF");
      await HardDriveService.createRDB(cacheLocation, 250, [
        { driveName: "DB1", fileSystem: "pfs", size: 250 },
      ]);
    } else {
      Logger.debug("Using existing HDF as DB1: as DB_CLIENT_CACHE:");
    }
    environmentSetup.attachHDF("DB1", cacheLocation);

    Logger.debug("Creating DB0: as DUCKBENCH: as new HDF");
    const location = path.join(
      environmentSetup.executionFolder,
      "duckbench.hdf",
    );
    await HardDriveService.createRDB(location, 100, [
      { driveName: "DB0", fileSystem: "pfs", size: 100 },
    ]);
    environmentSetup.attachHDF("DB0", location);
  }

  async install(
    config: SetupPluginConfig,
    communicator: Communicator,
    pluginStore: PluginStore,
  ) {
    const enterFile = await (
      pluginStore.getPlugin("RedirectInputFile") as RedirectInputFile
    ).createInput([""], communicator);

    try {
      const expectedResponse = "DB_CLIENT_CACHE: not assigned";
      await communicator.assign(
        "DB_CLIENT_CACHE:",
        "",
        { EXISTS: true },
        undefined,
        expectedResponse,
      );
      Logger.debug("Formatting DB1: as DB_CLIENT_CACHE: as new HDF");
      await communicator.format("DB1", "DB_CLIENT_CACHE", {
        ffs: true,
        quick: true,
        intl: true,
        noicons: true,
        REDIRECT_IN: enterFile,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Logger.debug("Using existing formatted HDF as DB1: as DB_CLIENT_CACHE:");
    }

    Logger.debug("Format DUCKBENCH: partition");
    await communicator.format("DB0", "DUCKBENCH", {
      ffs: true,
      quick: true,
      intl: true,
      noicons: true,
      REDIRECT_IN: enterFile,
    });

    await communicator.makedir("duckbench:c");
    await communicator.path("duckbench:c", { ADD: true });
    await communicator.makedir("duckbench:t");
    await communicator.makedir("duckbench:envarc");
    await communicator.makedir("duckbench:disks");
    await communicator.assign("t:", "duckbench:t");
    await communicator.assign("envarc:", "duckbench:envarc");
  }

  async finalise(
    config: SetupPluginConfig,
    environmentSetup: EnvironmentSetup,
    settings?: Settings,
  ) {
    const outputDirectory = SettingsService.getValueIfDefined(
      settings!,
      "Setup",
      "outputFolder",
    ) as string;
    const outputConfig = SettingsService.getValueIfDefined(
      settings!,
      "Setup",
      "outputConfig",
    ) as string;
    const rom310 = SettingsService.getValueIfDefined(
      settings!,
      "Setup",
      "rom310",
    ) as string;

    if (outputDirectory) {
      const outputWorkbench = path.join(
        environmentSetup.executionFolder,
        "NewWorkbench.hdf",
      );
      copyFileSync(
        outputWorkbench,
        path.join(outputDirectory, "NewWorkbench.hdf"),
      );
      if (outputConfig && outputConfig.length) {
        const emulatorRoot = SettingsService.getValue(
          settings!,
          "Setup",
          "emulator",
        ) as string;
        const amigaDefinition: AmigaDefinition = {
          ...Amiga1200,
          fastMemory: 8192,
          cpu: "68030",
        };

        const amiga: Amiga = {
          definition: amigaDefinition,
          disks: {
            HDF: [{ drive: "HD0", location: "./NewWorkbench.hdf" }],
            CD: [],
            MAPPED_DRIVE: [],
            ADF: [],
          },
        };
        const emulatorSettings: EmulatorSettings = {
          kickstarts: { "3.1": rom310 },
        };
        const newConfig = buildConfig(amiga, emulatorSettings, emulatorRoot);
        writeFileSync(path.join(outputDirectory, "config.uae"), newConfig);
      }
    }
  }
}
