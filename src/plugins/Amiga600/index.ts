import { CPU, Kickstart, Plugin, PluginConfig } from "../../types";
import EnvironmentSetup from "../../builder/EnvironmentSetup";
import { Amiga600 } from "../../amigas";

export interface A600PluginConfig extends PluginConfig {
  type: "system";
  id?: string;
  name: "Amiga600";
  optionValues: {
    rom: Kickstart;
    processor: CPU;
    chipMem: number;
    fastMem: number;
  };
}

export default class A600 implements Plugin<A600PluginConfig> {
  structure() {
    return {
      name: "Amiga600",
      label: "Amiga 600",
      description: "THE COMPUTER YOU`VE ALWAYS DREAMT ABOUT",
      type: "system",
      options: {
        rom: {
          name: "rom",
          label: "Kickstart Version",
          type: "list",
          items: [
            { label: "2.0/2.05", value: "2.05" },
            { label: "3.1", value: "3.1" },
            { label: "3.2", value: "3.2" },
          ],
          default: "2.05",
        },
        processor: {
          name: "processor",
          label: "Processor",
          type: "list",
          items: ["68000", "68020", "68030", "68040", "68060"],
          default: "68000",
        },
        chipMem: {
          name: "chipMem",
          label: "Chip RAM",
          type: "list",
          items: [
            { label: "1 MB", value: 1024 },
            { label: "1.5 MB", value: 1536 },
            { label: "2 MB", value: 2048 },
          ],
          default: "2",
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
      },
    };
  }

  async prepare(config: A600PluginConfig, environmentSetup: EnvironmentSetup) {
    environmentSetup.amigaDefinition = {
      ...Amiga600,
      cpu: config.optionValues?.processor,
      kickstart: config.optionValues?.rom,
      chipMemory: config.optionValues?.chipMem,
      fastMemory: config.optionValues?.fastMem,
    };
  }
}
