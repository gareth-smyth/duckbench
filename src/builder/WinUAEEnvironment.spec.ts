import { ChildProcess, spawn } from "child_process";
import path from "path";
import { writeFileSync } from "fs";

import WinUAEEnvironment from "./WinUAEEnvironment.js";
import { vi } from "vitest";
import EnvironmentSetup from "./EnvironmentSetup";
import { Settings } from "../types";
import { Amiga1200 } from "../amigas";

vi.mock("child_process");

const settings: Settings = {
  Setup: [
    { name: "emulator", value: "/path/to/winuae/WinUAE.exe" },
    { name: "rom310", value: { file: "some/place" } },
  ],
};

it("spawns a new winuae emulator process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      amigaDefinition: Amiga1200,
    } as unknown as EnvironmentSetup,
    {
      Setup: [
        { name: "emulator", value: "/path/to/winuae/WinUAE.exe" },
        { name: "rom310", value: { file: "some/place" } },
      ],
    },
  );
  environment.start();
  const configFileLocation = path.join("/some/folder/", "amiga.uae");
  expect(spawn).toHaveBeenCalledWith("/path/to/winuae/WinUAE.exe", [
    "-f",
    configFileLocation,
    "-G",
  ]);
});

it("spawns a new fs-uae emulator process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      amigaDefinition: Amiga1200,
    } as unknown as EnvironmentSetup,
    {
      Setup: [
        { name: "emulator", value: "/path/to/FS-UAE.exe" },
        { name: "rom310", value: { file: "some/place" } },
      ],
    },
  );
  environment.start();
  const configFileLocation = path.join("/some/folder/", "amiga.uae");
  expect(spawn).toHaveBeenCalledWith("/path/to/FS-UAE.exe", [
    "-f",
    configFileLocation,
    "-G",
  ]);
});

it("spawns a new amiberry emulator process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      amigaDefinition: Amiga1200,
    } as unknown as EnvironmentSetup,
    {
      Setup: [
        { name: "emulator", value: "/path/to/amiberry.exe" },
        { name: "rom310", value: { file: "some/place" } },
      ],
    },
  );
  environment.start();
  const configFileLocation = path.join("/some/folder/", "amiga.uae");
  expect(spawn).toHaveBeenCalledWith("/path/to/amiberry.exe", [
    "-f",
    configFileLocation,
    "-G",
  ]);
});

it("kills the winuae process", () => {
  const environment = new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      amigaDefinition: Amiga1200,
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
      amigaDefinition: Amiga1200,
    } as unknown as EnvironmentSetup,
    settings,
  );
  vi.mocked(spawn).mockReturnValueOnce(undefined as unknown as ChildProcess);
  environment.start();
  environment.stop();
});

it("writes the config", () => {
  new WinUAEEnvironment(
    {
      executionFolder: "/some/folder",
      disks: { ADF: [], HDF: [], CD: [], MAPPED_DRIVE: [] },
      amigaDefinition: Amiga1200,
    } as unknown as EnvironmentSetup,
    settings,
  );
  expect(writeFileSync).toHaveBeenCalledWith(
    path.join("/some/folder/", "amiga.uae"),
    expect.any(String),
  );
});
