import fs from "fs";

vi.mock("fs");
const mockedFs = fs as MockedObject<typeof fs>;

import Setup, { SetupPluginConfig } from "./index.js";
import { MockedObject, vi } from "vitest";
import { Settings } from "../../types";
import EnvironmentSetup from "../../builder/EnvironmentSetup";

let settings: Settings;
const config: SetupPluginConfig = { name: "Setup", type: "internal" };
const environmentSetup = new EnvironmentSetup();

beforeEach(() => {
  mockedFs.existsSync.mockClear();
  settings = {
    InstallWorkbench310: [{ name: "workbench", value: "workbench.adf" }],
    Setup: [
      { name: "emulator", value: import.meta.filename },
      { name: "rom310", value: "my_rom.rom" },
    ],
  };
});

it("returns no errors when setup is valid and WinUAE exists", () => {
  mockedFs.existsSync.mockReturnValue(true);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toEqual([]);
  expect(fs.existsSync).toHaveBeenCalledWith("workbench.adf");
  expect(fs.existsSync).toHaveBeenCalledWith("my_rom.rom");
  expect(fs.existsSync).toHaveBeenCalledWith(import.meta.filename);
  expect(fs.existsSync).toHaveBeenCalledTimes(3);
});

it("returns no errors when setup is valid and executable exists", () => {
  mockedFs.existsSync.mockReturnValue(true);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toEqual([]);
  expect(fs.existsSync).toHaveBeenCalledWith("workbench.adf");
  expect(fs.existsSync).toHaveBeenCalledWith(import.meta.filename);
  expect(fs.existsSync).toHaveBeenCalledWith("my_rom.rom");
  expect(fs.existsSync).toHaveBeenCalledTimes(3);
});

it("returns an error when workbench disk is not set", () => {
  mockedFs.existsSync.mockReturnValue(true);
  settings["InstallWorkbench310"][0].value = "";
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Workbench 3.1 ADF could not be found",
  });
  expect(errors.length).toEqual(1);
});

it("returns an error when workbench disk is set but does not exist", () => {
  mockedFs.existsSync.mockReturnValue(false);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Workbench 3.1 ADF could not be found at workbench.adf",
  });
  expect(fs.existsSync).toHaveBeenCalledWith("workbench.adf");
});

it("returns an error when winUAE path is not set", () => {
  mockedFs.existsSync.mockReturnValueOnce(true);
  settings["Setup"][0].value = "";
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Path to emulator is not set",
  });
});

it("returns an error when emulator path is set but can not find the executable", () => {
  mockedFs.existsSync.mockReturnValueOnce(false);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: `Could not find emulator executable at ${import.meta.filename}`,
  });
  expect(fs.existsSync).toHaveBeenCalledWith(import.meta.filename);
});

it("returns an error when rom file is not set", () => {
  mockedFs.existsSync.mockReturnValueOnce(true);
  mockedFs.existsSync.mockReturnValueOnce(true);
  mockedFs.existsSync.mockReturnValueOnce(true);
  settings["Setup"][1].value = "";
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Path to 310 rom file is not set",
  });
});

it("returns an error when rom file is set but does not exist", () => {
  mockedFs.existsSync.mockReturnValueOnce(true);
  mockedFs.existsSync.mockReturnValueOnce(true);
  mockedFs.existsSync.mockReturnValueOnce(false);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Could not find 310 ROM file at my_rom.rom",
  });
  expect(fs.existsSync).toHaveBeenCalledWith("my_rom.rom");
});
