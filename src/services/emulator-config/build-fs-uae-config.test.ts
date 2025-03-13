import { buildFsUaeConfig } from "./build-fs-uae-config";
import { Amiga500Plus } from "../../amigas";
import { Amiga, EmulatorSettings } from "../../types";

const standardAmiga: Amiga = {
  definition: Amiga500Plus,
  disks: { ADF: [], HDF: [], MAPPED_DRIVE: [], CD: [] },
};

const standardEmulatorSettings: EmulatorSettings = {
  kickstarts: {
    "2.04": "/my_rom.rom",
  },
};

it("loads base config", () => {
  const config = buildFsUaeConfig(standardAmiga, standardEmulatorSettings);

  expect(config).toContain("serial_port = TCP://0.0.0.0:8055");
  expect(config).toContain("serial_direct = true");
  expect(config).toContain("floppy_drive_volume = 0");
  expect(config).toContain(`amiga_model = ${standardAmiga.definition.model}`);
  expect(config).toContain(`cpu = ${standardAmiga.definition.cpu}`);
  expect(config).toContain(
    `fast_memory = ${standardAmiga.definition.fastMemory}`,
  );
  expect(config).toContain(
    `chip_memory = ${standardAmiga.definition.chipMemory}`,
  );
  expect(config).toContain(`uae_chipset = ${standardAmiga.definition.chipset}`);
  expect(config).toContain(
    `kickstart_file = ${standardEmulatorSettings.kickstarts[standardAmiga.definition.kickstart]}`,
  );
  expect(config).toContain(`floppy_drive_speed=0`);
});

it("configures floppy drives", () => {
  const config = buildFsUaeConfig(
    {
      ...standardAmiga,
      disks: { ...standardAmiga.disks, ADF: ["disk1.adf", "disk2.adf"] },
    },
    standardEmulatorSettings,
  );

  expect(config).toContain(`floppy_drive_0=disk1.adf`);
  expect(config).toContain(`floppy_drive_1=disk2.adf`);
});

it("configures mapped drives", () => {
  const config = buildFsUaeConfig(
    {
      ...standardAmiga,
      disks: {
        ...standardAmiga.disks,
        MAPPED_DRIVE: [{ location: "/drive/1" }, { location: "/drive/2" }],
      },
    },
    standardEmulatorSettings,
  );

  expect(config).toContain(`hard_drive_0=/drive/1`);
  expect(config).toContain(`hard_drive_1=/drive/2`);
});
