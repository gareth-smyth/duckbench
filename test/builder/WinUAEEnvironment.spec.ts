import { ChildProcess, spawn } from "child_process";
import path from "path";
import fs from "fs";

import WinUAEEnvironment from "../../src/builder/WinUAEEnvironment.js";
import { MockedObject, vi } from "vitest";
import EnvironmentSetup from "../../src/builder/EnvironmentSetup";
import { Settings } from "../../src/types";

vi.mock("child_process");
vi.mock("fs");
const mockedFs = fs as MockedObject<typeof fs>;

const settings: Settings = {
  Setup: [
    { name: "emulatorRoot", value: { folder: "/path/to/winuae/" } },
    { name: "rom310", value: { file: "some/place" } },
  ],
};

it("spawns a new winuae 32 bit process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "a_rom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  fs.existsSync = vi.fn().mockReturnValue(true);
  environment.start();
  const configFileLocation = path.join("/some/folder/", "amiga.uae");
  expect(spawn).toHaveBeenCalledWith(
    path.join("/path/to/winuae/", "WinUAE.exe"),
    ["-f", configFileLocation],
  );
});

it("spawns a new winuae 64 bit process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "a_rom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  fs.existsSync = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
  environment.start();
  const configFileLocation = path.join("/some/folder/", "amiga.uae");
  expect(spawn).toHaveBeenCalledWith(
    path.join("/path/to/winuae/", "WinUAE64.exe"),
    ["-f", configFileLocation],
  );
});

it("spawns a new fsuae process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "a_rom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  fs.existsSync = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(false);
  environment.start();
  const configFileLocation = path.join("/some/folder/", "amiga.uae");
  expect(spawn).toHaveBeenCalledWith(
    path.join("/path/to/winuae/", "FS-UAE.app/Contents/MacOS/FS-UAE"),
    ["-f", configFileLocation],
  );
});

it("kills the winuae process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "a_rom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  const process = { kill: vi.fn() } as unknown as ChildProcess;
  vi.mocked(spawn).mockReturnValueOnce(process);
  environment.start();
  environment.stop();
  expect(process.kill).toHaveBeenCalledTimes(1);
});

it("does not kill the winuae process when it does not exist", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "a_rom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  vi.mocked(spawn).mockReturnValueOnce(undefined as unknown as ChildProcess);
  environment.start();
  environment.stop();
});

it("writes the non-configurable parts of the config", () => {
  mockedFs.openSync.mockReturnValueOnce(112);
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "a_rom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(fs.openSync).toHaveBeenCalledWith(
    path.join("/some/folder/", "amiga.uae"),
    "w",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(112, "use_gui=no\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "// headless=true\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "use_debugger=true\n");
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "win32.serial_port=TCP://0.0.0.0:8552\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(112, "serial_direct=true\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "serial_translate=disabled\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "floppy_speed=0\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "cpu_speed=max\n");
});

it("writes the non-disk or cpu related parts of the config", () => {
  mockedFs.openSync.mockReturnValueOnce(112);
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "arom",
      cpu: "68000",
      chipMem: "4",
      fastMem: "someMem",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(fs.openSync).toHaveBeenCalledWith(
    path.join("/some/folder/", "amiga.uae"),
    "w",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "kickstart_rom_file=some/place\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(112, "chipmem_size=8\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "z3mem_size=someMem\n");
});

it("writes the cpu related parts of the config for a non-68030", () => {
  mockedFs.openSync.mockReturnValueOnce(112);
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "arom",
      cpu: "68000",
      chipMem: "4",
      fastMem: "someMem",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(fs.writeSync).toHaveBeenCalledWith(112, "cpu_type=68020\n");
});

it("writes the cpu related parts of the config for a 68030", () => {
  mockedFs.openSync.mockReturnValueOnce(112);
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      rom: "arom",
      cpu: "68000",
      chipMem: "4",
      fastMem: "someMem",
      getCPU: () => "68030",
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(fs.writeSync).toHaveBeenCalledWith(112, "cpu_type=68020\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "cpu_model=68030\n");
});

it("writes the floppy related parts of the config", () => {
  mockedFs.openSync.mockReturnValueOnce(112);
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: {
        ADF: ["some/disk.adf", "some/disk2.adf"],
        HDF: [],
        CD: [],
        MAPPED_DRIVE: [],
      },
      rom: "arom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(fs.openSync).toHaveBeenCalledWith(
    path.join("/some/folder/", "amiga.uae"),
    "w",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(112, "floppy0=some/disk.adf\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "floppy1=some/disk2.adf\n");
});

it("writes the CD related parts of the config", () => {
  mockedFs.openSync.mockReturnValueOnce(112);
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: {
        CD: [{ location: "some/disk.file" }, { location: "some/disk2.iso" }],
        ADF: [],
        HDF: [],
        MAPPED_DRIVE: [],
      },
      rom: "arom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(fs.openSync).toHaveBeenCalledWith(
    path.join("/some/folder/", "amiga.uae"),
    "w",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(112, "win32.map_cd_drives=true\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "cdimage0=some/disk.file\n");
  expect(fs.writeSync).toHaveBeenCalledWith(112, "cdimage1=some/disk2.iso\n");
});

it("writes the uaehf related parts of the config", () => {
  mockedFs.openSync.mockReturnValueOnce(112);
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: {
        HDF: [
          { drive: "dh0", location: "some/disk.hdf" },
          { drive: "dh4", location: "some/disk2.hdf" },
        ],
        MAPPED_DRIVE: [
          {
            drive: "dh3",
            name: "drive1",
            location: "some/folder",
            writeable: true,
          },
          {
            drive: "dh2",
            name: "drive2",
            location: "some/folder2",
            writeable: false,
          },
        ],
        ADF: [],
        CD: [],
      },
      rom: "arom",
      getCPU: () => "68020",
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(fs.openSync).toHaveBeenCalledWith(
    path.join("/some/folder/", "amiga.uae"),
    "w",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "hardfile2=rw,dh0:some/disk.hdf,0,0,0,512,0,,uae0\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "uaehf0=hdf,rw,dh0:some/disk.hdf,0,0,0,512,0,,uae0\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "hardfile2=rw,dh4:some/disk2.hdf,0,0,0,512,0,,uae1\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "uaehf1=hdf,rw,dh4:some/disk2.hdf,0,0,0,512,0,,uae1\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "filesystem2=rw,dh3:drive1:some/folder,-128\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "uaehf2=dir,rw,dh3:drive1:some/folder,-128\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "filesystem2=ro,dh2:drive2:some/folder2,-128\n",
  );
  expect(fs.writeSync).toHaveBeenCalledWith(
    112,
    "uaehf3=dir,ro,dh2:drive2:some/folder2,-128\n",
  );
});
