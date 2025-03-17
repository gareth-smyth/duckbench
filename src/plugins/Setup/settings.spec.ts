import RomFinderService from "../../services/RomFinderService.js";
import { existsSync } from "fs";
import path from "path";
vi.mock("../../../src/services/RomFinderService");

RomFinderService.find = vi.fn();

import Settings from "./settings.js";
import { vi } from "vitest";

describe("emulatorRoot", () => {
  it("defaults emulator root to DUCKBENCH_EMU when it is set", () => {
    const settings = new Settings();
    process.env.DUCKBENCH_EMU = "Some place";
    expect(settings.default("emulator")).toEqual("Some place/WinUAE.exe");
  });

  it("defaults emulator root to C:/Program Files/WinUAE when DUCKBENCH_EMU is not set", () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    vi.mocked(existsSync)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);
    expect(settings.default("emulator")).toEqual(
      "C:/Program Files/WinUAE/WinUAE64.exe",
    );
  });

  it("defaults emulator root to C:/Program Files (x86)/WinUAE when DUCKBENCH_EMU is not set", () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    expect(settings.default("emulator")).toEqual(
      "C:/Program Files (x86)/WinUAE/WinUAE.exe",
    );
  });

  it("defaults emulator root to /Applications when DUCKBENCH_EMU is not set", () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    expect(settings.default("emulator")).toEqual(
      "/Applications/Amiberry.app/Contents/MacOS/Amiberry",
    );
  });

  it("defaults emulator root to /Applications when DUCKBENCH_EMU is not set", () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    vi.mocked(existsSync)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    expect(settings.default("emulator")).toEqual(
      "/Applications/FS-UAE.app/Contents/MacOS/FS-UAE",
    );
  });

  it("defaults emulator root to undefined when DUCKBENCH_EMU is not set and not found in program files", () => {
    const settings = new Settings();
    delete process.env.DUCKBENCH_EMU;
    vi.mocked(existsSync).mockReturnValueOnce(false).mockReturnValueOnce(false);
    expect(settings.default("emulator")).toEqual({});
  });
});

describe("rom310", function () {
  it("returns an empty object when neither DUCKBENCH_ROMS or AMIGAFOREVERDATA is set", async () => {
    delete process.env.DUCKBENCH_ROMS;
    delete process.env.AMIGAFOREVERDATA;

    const settings = new Settings();
    const def = settings.default("rom310");

    expect(def).toEqual({});
  });

  it("calls system disk service when DUCKBENCH_ROMS is set", async () => {
    process.env.DUCKBENCH_ROMS = "somePlace";
    vi.mocked(RomFinderService.find).mockReturnValueOnce({ file: "theValue" });

    const settings = new Settings();
    const def = settings.default("rom310");

    expect(def).toEqual({ file: "theValue" });
    expect(RomFinderService.find).toHaveBeenCalledWith("3.1", "somePlace");
  });

  it("calls system disk service when AMIGAFOREVERDATA is set", async () => {
    delete process.env.DUCKBENCH_ROMS;
    process.env.AMIGAFOREVERDATA = "somePlace";
    vi.mocked(RomFinderService.find).mockReturnValueOnce({ file: "theValue" });

    const settings = new Settings();
    const def = settings.default("rom310");

    expect(def).toEqual({ file: "theValue" });
    expect(RomFinderService.find).toHaveBeenCalledWith(
      "3.1",
      path.join("somePlace", "Shared", "rom"),
    );
  });
});
