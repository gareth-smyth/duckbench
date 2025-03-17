import { Amiga, EmulatorSettings, EmulatorType } from "../../types";
import { buildWinUaeConfig } from "./build-win-uae-config";
import { buildFsUaeConfig } from "./build-fs-uae-config";
import { buildAmiberryConfig } from "./build-amiberry-config";

export function buildConfig(
  amiga: Amiga,
  emulatorSettings: EmulatorSettings,
  emulatorExe: string,
): string {
  const emulatorType = getEmulatorType(emulatorExe);
  switch (emulatorType) {
    case "WinUAE":
      return buildWinUaeConfig(amiga, emulatorSettings);
    case "FS-UAE":
      return buildFsUaeConfig(amiga, emulatorSettings);
    case "Amiberry":
      return buildAmiberryConfig(amiga, emulatorSettings);
  }
}

function getEmulatorType(emulator: string): EmulatorType {
  if (emulator.toLowerCase().includes("winuae")) {
    return "WinUAE";
  } else if (emulator.toLowerCase().includes("amiberry")) {
    return "Amiberry";
  } else if (emulator.toLowerCase().includes("fs-uae")) {
    return "FS-UAE";
  } else {
    throw Error("Could not find an emulator");
  }
}
