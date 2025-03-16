import { Amiga, EmulatorSettings } from "../../types";

export function buildAmiberryConfig(
  amiga: Amiga,
  emulatorSettings: EmulatorSettings,
): string {
  const configLines: string[] = [];

  configLines.push(
    "# Amiberry config created by DuckBench on " + Date.now().toString(),
  );
  configLines.push("");
  configLines.push("serial_port=TCP://0.0.0.0:8055");
  configLines.push("serial_direct=true");
  configLines.push("serial_translate=disabled");
  configLines.push("");

  configLines.push(`cpu_type=${amiga.definition.cpu}`);
  configLines.push(`z3mem_size=${amiga.definition.fastMemory}`);
  configLines.push(`chipmem_size=${amiga.definition.chipMemory}`);
  configLines.push(`chipset=${amiga.definition.chipset}`);
  configLines.push("");

  configLines.push(
    `kickstart_rom_file=${emulatorSettings.kickstarts[amiga.definition.kickstart]}`,
  );
  configLines.push("");

  configLines.push(`floppy_speed=0`);
  amiga.disks.ADF.forEach((adf, index) => {
    configLines.push(`floppy${index}=${adf}`);
  });
  configLines.push("");

  let diskIdx = 0;
  amiga.disks.HDF.forEach((disk) => {
    const hardfileLine = `hardfile2=rw,${disk.drive}:${disk.location},0,0,0,512,0,,uae${diskIdx}`;
    const hfLine = `uaehf${diskIdx}=hdf,rw,${disk.drive}:${disk.location},0,0,0,512,0,,uae${diskIdx}`;
    configLines.push(hardfileLine);
    configLines.push(hfLine);
    diskIdx += 1;
  });

  amiga.disks.MAPPED_DRIVE.forEach((mappedDriveDefinition) => {
    const readWrite = mappedDriveDefinition.writeable ? "rw" : "ro";
    configLines.push(
      `filesystem2=${readWrite},${mappedDriveDefinition.drive}:${mappedDriveDefinition.name}:${mappedDriveDefinition.location},-128`,
    );
    configLines.push(
      `uaehf${diskIdx}=dir,${readWrite},${mappedDriveDefinition.drive}:${mappedDriveDefinition.name}:${mappedDriveDefinition.location},-128`,
    );
    diskIdx += 1;
  });
  configLines.push("");

  if (amiga.disks.CD.length) {
    configLines.push("win32.map_cd_drives=true");
    amiga.disks.CD.forEach((disk, cdIdx) => {
      configLines.push(`cdimage${cdIdx}=${disk}`);
    });
  }
  configLines.push("");

  return configLines.join("\n");
}
