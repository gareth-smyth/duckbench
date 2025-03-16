import { AmigaCD32 } from "../../amigas.js";
import EnvironmentSetup from "../../builder/EnvironmentSetup";
import { CPU, Kickstart, Plugin, PluginConfig } from "../../types";

export interface CD32PluginConfig extends PluginConfig {
  type: "system";
  id?: string;
  name: "AmigaCD32";
  optionValues: {
    rom: Kickstart;
    processor: CPU;
    fastMem: number;
  };
}

export default class CD32 implements Plugin<CD32PluginConfig> {
  structure() {
    return {
      name: "CD32",
      label: "Amiga CD32",
      description: "The Ultimate Game Machine",
      type: "system",
      options: {
        rom: {
          name: "rom",
          label: "Kickstart Version",
          type: "list",
          items: [
            { label: "3.1", value: "3.1" },
            { label: "3.2", value: "3.2" },
          ],
          default: "3.1",
        },
        processor: {
          name: "processor",
          label: "Processor",
          type: "list",
          items: ["68020", "68030", "68060"],
          default: "68020",
        },
        fastMem: {
          name: "fastMem",
          label: "Other RAM",
          type: "list",
          items: [
            { label: "None", value: 0 },
            { label: "4 MB", value: 4096 },
            { label: "8 MB", value: 8192 },
            { label: "64 MB", value: 65536 },
          ],
          default: 0,
        },
        floppyDrive: {
          name: "floppyDrive",
          label: "Floppy Drive?",
          type: "list",
          items: ["No", "Yes"],
          default: "No",
        },
      },
    };
  }

  async prepare(config: CD32PluginConfig, environmentSetup: EnvironmentSetup) {
    environmentSetup.amigaDefinition = {
      ...AmigaCD32,
      cpu: config.optionValues?.processor,
      kickstart: config.optionValues?.rom,
      fastMemory: config.optionValues?.fastMem,
    };
  }
}
