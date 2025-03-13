import { Amiga, EmulatorSettings } from "../../types";

export function buildFsUaeConfig(
  amiga: Amiga,
  emulatorSettings: EmulatorSettings,
): string {
  const configLines: string[] = [];

  configLines.push(
    "# FS-UAE config created by DuckBench on " + Date.now().toString(),
  );
  configLines.push("");
  configLines.push("serial_port = TCP://0.0.0.0:8055");
  configLines.push("serial_direct = true");
  configLines.push("floppy_drive_volume = 0");
  configLines.push("");

  configLines.push(`amiga_model = ${amiga.definition.model}`);
  configLines.push(`cpu = ${amiga.definition.cpu}`);
  configLines.push(`fast_memory = ${amiga.definition.fastMemory}`);
  configLines.push(`chip_memory = ${amiga.definition.chipMemory}`);
  configLines.push(`uae_chipset = ${amiga.definition.chipset}`);
  configLines.push("");

  configLines.push(
    `kickstart_file = ${emulatorSettings.kickstarts[amiga.definition.kickstart]}`,
  );
  configLines.push("");

  configLines.push(`floppy_drive_speed=0`);
  amiga.disks.ADF.forEach((adf, index) => {
    configLines.push(`floppy_drive_${index}=${adf}`);
  });
  configLines.push("");

  amiga.disks.MAPPED_DRIVE.forEach((mappedDriveDefinition, index) => {
    configLines.push(`hard_drive_${index}=${mappedDriveDefinition.location}`);
  });
  configLines.push("");

  return configLines.join("\n");
}
