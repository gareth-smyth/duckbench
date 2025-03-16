import { CPU, Kickstart, Plugin, PluginConfig } from "../../types";
import EnvironmentSetup from "../../builder/EnvironmentSetup";
import { Amiga1200 } from "../../amigas";

export interface A1200PluginConfig extends PluginConfig {
  type: "system";
  id?: string;
  name: "Amiga1200";
  optionValues: {
    rom: Kickstart;
    processor: CPU;
    fastMem: number;
  };
}

export default class A1200 implements Plugin<A1200PluginConfig> {
  structure() {
    return {
      name: "Amiga1200",
      label: "Amiga 1200",
      description: "The home computer for the 90s",
      type: "system",
      options: {
        rom: {
          name: "rom",
          label: "Kickstart Version",
          type: "list",
          items: ["3.0", "3.1", "3.2"],
          default: "3.1",
        },
        processor: {
          name: "processor",
          label: "Processor",
          type: "list",
          items: ["68020", "68030", "68040", "68060"],
          default: "68020",
        },
        fastMem: {
          name: "fastMem",
          label: "Other RAM",
          type: "list",
          items: [
            { label: "None", value: 0 },
            { label: "4 MB+", value: 4096 },
            { label: "8 MB+", value: 8112 },
            { label: "64 MB+", value: 65536 },
          ],
          default: 0,
        },
      },
    };
  }

  async prepare(config: A1200PluginConfig, environmentSetup: EnvironmentSetup) {
    environmentSetup.amigaDefinition = {
      ...Amiga1200,
      cpu: config.optionValues?.processor,
      kickstart: config.optionValues?.rom,
      fastMemory: config.optionValues?.fastMem,
    };
  }
}
