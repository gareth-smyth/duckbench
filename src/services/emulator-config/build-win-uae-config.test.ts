import { buildWinUaeConfig } from "./build-win-uae-config";
import { Amiga4000 } from "../../amigas";
import { Amiga, EmulatorSettings } from "../../types";

const standardAmiga: Amiga = {
  definition: Amiga4000,
  disks: { ADF: [], HDF: [], MAPPED_DRIVE: [], CD: [] },
};

const standardEmulatorSettings: EmulatorSettings = {
  kickstarts: {
    "3.0": "/my_rom.rom",
  },
};

it("loads base config", () => {
  const config = buildWinUaeConfig(standardAmiga, standardEmulatorSettings);

  expect(config).toContain("win32.serial_port=TCP://0.0.0.0:8055");
  expect(config).toContain("serial_direct=true");
  expect(config).toContain("serial_translate=disabled");
  expect(config).toContain(`cpu_type=${standardAmiga.definition.cpu}`);
  expect(config).toContain(`z3mem_size=${standardAmiga.definition.fastMemory}`);
  expect(config).toContain(
    `chipmem_size=${standardAmiga.definition.chipMemory}`,
  );
  expect(config).toContain(`chipset=${standardAmiga.definition.chipset}`);
  expect(config).toContain(
    `kickstart_rom_file=${standardEmulatorSettings.kickstarts[standardAmiga.definition.kickstart]}`,
  );
  expect(config).toContain(`floppy_speed=0`);
});

it("configures floppy drives", () => {
  const config = buildWinUaeConfig(
    {
      ...standardAmiga,
      disks: { ...standardAmiga.disks, ADF: ["disk1.adf", "disk2.adf"] },
    },
    standardEmulatorSettings,
  );

  expect(config).toContain(`floppy_drive_0=disk1.adf`);
  expect(config).toContain(`floppy_drive_1=disk2.adf`);
});

it("configures CD drives", () => {
  const config = buildWinUaeConfig(
    {
      ...standardAmiga,
      disks: { ...standardAmiga.disks, CD: ["disc1.iso", "disc2.iso"] },
    },
    standardEmulatorSettings,
  );

  expect(config).toContain(`win32.map_cd_drives=true`);
  expect(config).toContain(`cdimage0=disc1.iso`);
  expect(config).toContain(`cdimage1=disc2.iso`);
});

it("configures drives", () => {
  const config = buildWinUaeConfig(
    {
      ...standardAmiga,
      disks: {
        ...standardAmiga.disks,
        MAPPED_DRIVE: [
          { location: "/drive/1", drive: "df1", name: "d1", writeable: true },
          { location: "/drive/2", drive: "df2", name: "d2" },
        ],
        HDF: [
          { location: "/drive/3.hdf", drive: "df1" },
          { location: "/drive/2.hdf", drive: "df2" },
        ],
      },
    },
    standardEmulatorSettings,
  );

  expect(config).toContain(`hardfile2=rw,df1:/drive/3.hdf,0,0,0,512,0,,uae0`);
  expect(config).toContain(`uaehf0=hdf,rw,df1:/drive/3.hdf,0,0,0,512,0,,uae0`);
  expect(config).toContain(`hardfile2=rw,df2:/drive/2.hdf,0,0,0,512,0,,uae1`);
  expect(config).toContain(`uaehf1=hdf,rw,df2:/drive/2.hdf,0,0,0,512,0,,uae1`);

  expect(config).toContain(`filesystem2=rw,df1:d1:/drive/1,-128`);
  expect(config).toContain(`uaehf2=dir,rw,df1:d1:/drive/1,-128`);
  expect(config).toContain(`filesystem2=ro,df2:d2:/drive/2,-128`);
  expect(config).toContain(`uaehf3=dir,ro,df2:d2:/drive/2,-128`);
});
