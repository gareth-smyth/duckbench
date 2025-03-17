import { existsSync } from "fs";

import { vi } from "vitest";
import { Settings } from "../../types";
import EnvironmentSetup from "../../builder/EnvironmentSetup";
import Setup, { SetupPluginConfig } from "./index";

let settings: Settings;
const config: SetupPluginConfig = { name: "Setup", type: "internal" };
const environmentSetup = new EnvironmentSetup();

beforeEach(() => {
  vi.mocked(existsSync).mockClear();
  settings = {
    InstallWorkbench310: [{ name: "workbench", value: "workbench.adf" }],
    Setup: [
      { name: "emulator", value: import.meta.filename },
      { name: "rom310", value: "my_rom.rom" },
    ],
  };
});

it("returns no errors when setup is valid and WinUAE exists", () => {
  vi.mocked(existsSync).mockReturnValue(true);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toEqual([]);
  expect(existsSync).toHaveBeenCalledWith("workbench.adf");
  expect(existsSync).toHaveBeenCalledWith("my_rom.rom");
  expect(existsSync).toHaveBeenCalledWith(import.meta.filename);
  expect(existsSync).toHaveBeenCalledTimes(3);
});

it("returns no errors when setup is valid and executable exists", () => {
  vi.mocked(existsSync).mockReturnValue(true);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toEqual([]);
  expect(existsSync).toHaveBeenCalledWith("workbench.adf");
  expect(existsSync).toHaveBeenCalledWith(import.meta.filename);
  expect(existsSync).toHaveBeenCalledWith("my_rom.rom");
  expect(existsSync).toHaveBeenCalledTimes(3);
});

it("returns an error when workbench disk is not set", () => {
  vi.mocked(existsSync).mockReturnValue(true);
  settings["InstallWorkbench310"][0].value = "";
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Workbench 3.1 ADF could not be found",
  });
  expect(errors.length).toEqual(1);
});

it("returns an error when workbench disk is set but does not exist", () => {
  vi.mocked(existsSync).mockReturnValue(false);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Workbench 3.1 ADF could not be found at workbench.adf",
  });
  expect(existsSync).toHaveBeenCalledWith("workbench.adf");
});

it("returns an error when winUAE path is not set", () => {
  vi.mocked(existsSync).mockReturnValueOnce(true);
  settings["Setup"][0].value = "";
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Path to emulator is not set",
  });
});

it("returns an error when emulator path is set but can not find the executable", () => {
  vi.mocked(existsSync).mockReturnValueOnce(false);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: `Could not find emulator executable at ${import.meta.filename}`,
  });
  expect(existsSync).toHaveBeenCalledWith(import.meta.filename);
});

it("returns an error when rom file is not set", () => {
  vi.mocked(existsSync).mockReturnValueOnce(true);
  vi.mocked(existsSync).mockReturnValueOnce(true);
  vi.mocked(existsSync).mockReturnValueOnce(true);
  settings["Setup"][1].value = "";
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Path to 310 rom file is not set",
  });
});

it("returns an error when rom file is set but does not exist", () => {
  vi.mocked(existsSync).mockReturnValueOnce(true);
  vi.mocked(existsSync).mockReturnValueOnce(true);
  vi.mocked(existsSync).mockReturnValueOnce(false);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Could not find 310 ROM file at my_rom.rom",
  });
  expect(existsSync).toHaveBeenCalledWith("my_rom.rom");
});
