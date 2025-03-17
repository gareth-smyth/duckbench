import { existsSync } from "fs";
import { vi } from "vitest";
import { Settings } from "../../types";
import Setup from "./index";

let settings: Settings;
const config = undefined;
const environmentSetup = undefined;

beforeEach(() => {
  settings = {
    InstallWorkbench390: [{ name: "isoLocation", value: "wb39.iso" }],
  };
});

it("returns no errors when iso location is set and exists", () => {
  vi.mocked(existsSync).mockReturnValue(true);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toEqual([]);
  expect(existsSync).toHaveBeenCalledWith("wb39.iso");
  expect(existsSync).toHaveBeenCalledTimes(1);
});

it("returns an error when iso location is not set", () => {
  vi.mocked(existsSync).mockReturnValue(true);
  settings["InstallWorkbench390"][0].value = "";
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Workbench 3.9 ISO could not be found",
  });
  expect(errors.length).toEqual(1);
});

it("returns an error when iso location is set but does not exist", () => {
  vi.mocked(existsSync).mockReturnValue(false);
  const errors = new Setup().validate(config, environmentSetup, settings);
  expect(errors).toContainEqual({
    type: "error",
    text: "Workbench 3.9 ISO could not be found at wb39.iso",
  });
  expect(existsSync).toHaveBeenCalledWith("wb39.iso");
});
