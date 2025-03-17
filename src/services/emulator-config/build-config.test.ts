import { vi } from "vitest";
import { EmulatorSettings } from "../../types";
import { Amiga4000 } from "../../amigas";
import { buildConfig } from "./build-config";
import { buildWinUaeConfig } from "./build-win-uae-config";
import { buildFsUaeConfig } from "./build-fs-uae-config";
import { buildAmiberryConfig } from "./build-amiberry-config";

vi.mock("./build-amiberry-config");
vi.mock("./build-fs-uae-config");
vi.mock("./build-win-uae-config");

const emulatorSettings: EmulatorSettings = {} as unknown as EmulatorSettings;
const basicAmiga = {
  definition: Amiga4000,
  disks: { CD: [], HDF: [], MAPPED_DRIVE: [], ADF: [] },
};
const expectedConfig = "My built config";

it("builds WinUAE config if the emulator exe contains winuae", () => {
  vi.mocked(buildWinUaeConfig).mockReturnValueOnce(expectedConfig);
  const builtConfig = buildConfig(
    basicAmiga,
    emulatorSettings,
    "/some/winuae64.exe",
  );

  expect(builtConfig).toEqual(expectedConfig);
  expect(buildWinUaeConfig).toHaveBeenCalledWith(basicAmiga, emulatorSettings);
  expect(buildFsUaeConfig).not.toHaveBeenCalled();
  expect(buildAmiberryConfig).not.toHaveBeenCalled();
});

it("builds Amiberry config if the emulator exe contains amiberry", () => {
  vi.mocked(buildAmiberryConfig).mockReturnValueOnce(expectedConfig);
  const builtConfig = buildConfig(
    basicAmiga,
    emulatorSettings,
    "/some/amiberry.exe",
  );

  expect(builtConfig).toEqual(expectedConfig);
  expect(buildAmiberryConfig).toHaveBeenCalledWith(
    basicAmiga,
    emulatorSettings,
  );
  expect(buildFsUaeConfig).not.toHaveBeenCalled();
  expect(buildWinUaeConfig).not.toHaveBeenCalled();
});

it("builds FS-UAE config if the emulator exe contains fs-uae", () => {
  vi.mocked(buildFsUaeConfig).mockReturnValueOnce(expectedConfig);
  const builtConfig = buildConfig(
    basicAmiga,
    emulatorSettings,
    "/some/fs-uae.exe",
  );

  expect(builtConfig).toEqual(expectedConfig);
  expect(buildFsUaeConfig).toHaveBeenCalledWith(basicAmiga, emulatorSettings);
  expect(buildWinUaeConfig).not.toHaveBeenCalled();
  expect(buildAmiberryConfig).not.toHaveBeenCalled();
});

it("throws an exception if it can't work out the type of emulator", () => {
  expect(() =>
    buildConfig(basicAmiga, emulatorSettings, "/some/weird-emu.exe"),
  ).toThrow("Could not find an emulator");
});
