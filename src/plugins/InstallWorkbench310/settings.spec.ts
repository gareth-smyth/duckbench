import path from "path";

import { existsSync } from "fs";

import SystemDiskService from "../../services/SystemDiskService.js";
vi.mock("../../../src/services/SystemDiskService");
const mockedSystemDiskService = SystemDiskService as MockedObject<
  typeof SystemDiskService
>;

import Settings from "./settings.js";
import { MockedObject, vi } from "vitest";

describe("get", () => {
  it("returns the top level details", () => {
    const settings = new Settings();
    const wb310Settings = settings.get();
    expect(wb310Settings.name).toEqual("InstallWorkbench310");
    expect(wb310Settings.label).toEqual("Workbench 3.1");
  });

  it("returns a setting for each disk", () => {
    const settings = new Settings();
    const wb310Settings = settings.get();
    expect(wb310Settings.settings.length).toEqual(6);
    expect(wb310Settings.settings[0].name).toEqual("install");
    expect(wb310Settings.settings[0].type).toEqual("hostFile");
    expect(wb310Settings.settings[0].label).toEqual("Install disk");
    expect(wb310Settings.settings[0].hasDefaultSearch).toEqual(true);
  });

  it("returns cached true setting when cache marker exists", () => {
    vi.mocked(existsSync).mockReturnValue(true);
    const settings = new Settings();
    const wb310Settings = settings.get();
    expect(wb310Settings.settings.length).toEqual(6);
    expect(wb310Settings.settings[0].cached).toEqual(true);
  });

  it("returns cached false setting when cache marker does not exist", () => {
    vi.mocked(existsSync).mockReturnValue(false);
    const settings = new Settings();
    const wb310Settings = settings.get();
    expect(wb310Settings.settings.length).toEqual(6);
    expect(wb310Settings.settings[0].cached).toEqual(false);
  });
});

describe("default", () => {
  it("returns an empty object when neither DUCKBENCH_DISKS or AMIGAFOREVERDATA is set", async () => {
    delete process.env.DUCKBENCH_DISKS;
    delete process.env.AMIGAFOREVERDATA;

    const settings = new Settings();
    const def = await settings.default("aSetting");

    expect(def).toEqual({});
  });

  it("calls system disk service when DUCKBENCH_DISKS is set", async () => {
    process.env.DUCKBENCH_DISKS = "somePlace";
    mockedSystemDiskService.find.mockResolvedValueOnce({ file: "theValue" });

    const settings = new Settings();
    const def = await settings.default("aSetting");

    expect(def).toEqual({ file: "theValue" });
    expect(SystemDiskService.find).toHaveBeenCalledWith(
      "3.1",
      "aSetting",
      "somePlace",
    );
  });

  it("calls system disk service when AMIGAFOREVERDATA is set", async () => {
    delete process.env.DUCKBENCH_DISKS;
    process.env.AMIGAFOREVERDATA = "somePlace";
    mockedSystemDiskService.find.mockResolvedValueOnce({ file: "theValue" });

    const settings = new Settings();
    const def = await settings.default("aSetting");

    expect(def).toEqual({ file: "theValue" });
    expect(SystemDiskService.find).toHaveBeenCalledWith(
      "3.1",
      "aSetting",
      path.join("somePlace", "Shared", "adf"),
    );
  });
});
