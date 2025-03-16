import EnvironmentSetup from "../../builder/EnvironmentSetup";
import { Amiga500 } from "../../amigas";
import { CPU, Kickstart, Plugin, PluginConfig } from "../../types";

export interface A500PluginConfig extends PluginConfig {
  type: "system";
  id?: string;
  name: "Amiga500";
  optionValues: {
    rom: Kickstart;
    processor: CPU;
    chipMem: number;
    fastMem: number;
  };
}

export default class A500 implements Plugin<A500PluginConfig> {
  structure() {
    return {
      name: "Amiga500",
      label: "Amiga 500",
      description: "Only Amiga makes it possible.",
      type: "system",
      options: {
        rom: {
          name: "rom",
          label: "Kickstart Version",
          type: "list",
          items: [
            { label: "2.05", value: "2.05" },
            { label: "3.1", value: "3.1" },
            { label: "3.2", value: "3.2" },
          ],
          default: "3.1",
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
            { label: "0.5 MB", value: 512 },
            { label: "1 MB", value: 1024 },
            { label: "1.5 MB", value: 1536 },
            { label: "2 MB", value: 2048 },
          ],
          default: "1024",
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

  async prepare(config: A500PluginConfig, environmentSetup: EnvironmentSetup) {
    environmentSetup.amigaDefinition = {
      ...Amiga500,
      cpu: config.optionValues?.processor,
      kickstart: config.optionValues?.rom,
      chipMemory: config.optionValues?.chipMem,
      fastMemory: config.optionValues?.fastMem,
    };
  }
}
