/* eslint-disable no-global-assign */
import { when } from "jest-when";
import fs from "fs";
import path from "path";
import { vi } from "vitest";

import EnvironmentSetup from "./EnvironmentSetup.js";
import { BASE_DIR } from "../services/BaseDirService";
import { Amiga1000 } from "../amigas";

vi.mock("fs");

let RealDate: typeof Date;

beforeEach(() => {
  RealDate = Date;
});

afterEach(() => {
  Date = RealDate;
});

it("creates the execution root folder and execution folder if it does not exist", () => {
  when(fs.existsSync)
    .expectCalledWith(path.join(BASE_DIR, "execution"))
    .mockReturnValueOnce(false);

  Date = vi.fn(
    () => new RealDate("2020-04-01T17:29:30.235Z"),
  ) as unknown as typeof Date;

  new EnvironmentSetup();

  expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
  expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(BASE_DIR, "execution"));
  expect(fs.mkdirSync).toHaveBeenCalledWith(
    path.join(BASE_DIR, "execution", "20200401172930235"),
  );
});

it("deletes the execution folder when destroy is called.", () => {
  when(fs.existsSync)
    .expectCalledWith(path.join(BASE_DIR, "execution"))
    .mockReturnValueOnce(false);

  Date = vi.fn(
    () => new RealDate("2020-04-01T17:29:30.235Z"),
  ) as unknown as typeof Date;

  const environmentSetup = new EnvironmentSetup();
  environmentSetup.destroy();

  expect(fs.rmdirSync).toHaveBeenCalledTimes(1);
  const executionFolder = path.join(BASE_DIR, "execution", "20200401172930235");
  expect(fs.rmdirSync).toHaveBeenCalledWith(executionFolder, {
    recursive: true,
  });
});

it("creates only the execution folder if the root folder exists", () => {
  when(fs.existsSync)
    .expectCalledWith(path.join(BASE_DIR, "execution"))
    .mockReturnValueOnce(true);

  Date = vi.fn(
    () => new RealDate("2020-04-01T18:29:30.235Z"),
  ) as unknown as typeof Date;

  new EnvironmentSetup();

  expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
  expect(fs.mkdirSync).toHaveBeenCalledWith(
    path.join(BASE_DIR, "execution", "20200401182930235"),
  );
});

it("sets the system name", () => {
  const environmentSetup = new EnvironmentSetup();
  environmentSetup.amigaDefinition = Amiga1000;
  expect(environmentSetup.amigaDefinition.model).toEqual("A1000");
});

it("sets the cd drive", () => {
  const environmentSetup = new EnvironmentSetup();
  environmentSetup.insertCDISO("/my/location");
  environmentSetup.insertCDISO("/my/other/location");
  expect(environmentSetup.disks.CD[0]).toEqual("/my/location");
  expect(environmentSetup.disks.CD[1]).toEqual("/my/other/location");
});

it("adds HDFs", () => {
  const environmentSetup = new EnvironmentSetup();
  environmentSetup.attachHDF("dh0:", "/home/drive1");
  environmentSetup.attachHDF("dh3:", "/home/drive2");
  expect(environmentSetup.disks.HDF[0]).toEqual({
    drive: "dh0:",
    location: "/home/drive1",
  });
  expect(environmentSetup.disks.HDF[1]).toEqual({
    drive: "dh3:",
    location: "/home/drive2",
  });
});

it("maps folders to drives", () => {
  const environmentSetup = new EnvironmentSetup();
  environmentSetup.mapFolderToDrive("dh0:", "/home/drive1", "driveA");
  environmentSetup.mapFolderToDrive("dh3:", "/home/drive2", "driveB", true);
  expect(environmentSetup.disks.MAPPED_DRIVE[0]).toEqual({
    drive: "dh0:",
    location: "/home/drive1",
    name: "driveA",
    writeable: false,
  });
  expect(environmentSetup.disks.MAPPED_DRIVE[1]).toEqual({
    drive: "dh3:",
    location: "/home/drive2",
    name: "driveB",
    writeable: true,
  });
});

it("inserts amiga and non-amiga os ADFs", () => {
  Date = vi.fn(
    () => new RealDate("2020-04-01T20:29:30.235Z"),
  ) as unknown as typeof Date;
  const environmentSetup = new EnvironmentSetup();

  environmentSetup.insertDisk("df0", "/home/disk1.adf");
  environmentSetup.insertDisk("df1", "amiga_os_3.1.adf");
  environmentSetup.insertDisk("df5", "/home/disk2.adf");
  const bootDiskLocation = path.join(
    BASE_DIR,
    "execution",
    "20200401202930235",
    "df0.adf",
  );
  expect(environmentSetup.disks.ADF[0]).toEqual(bootDiskLocation);
  const wbDiskLocation = path.join(
    BASE_DIR,
    "execution",
    "20200401202930235",
    "df1.adf",
  );
  expect(environmentSetup.disks.ADF[1]).toEqual(wbDiskLocation);
  const otherDiskLocation = path.join(
    BASE_DIR,
    "execution",
    "20200401202930235",
    "df5.adf",
  );
  expect(environmentSetup.disks.ADF[2]).toEqual(otherDiskLocation);
});

it("sets disk permissions for non amiga os disks", () => {
  Date = vi.fn(
    () => new RealDate("2020-04-01T20:29:30.235Z"),
  ) as unknown as typeof Date;
  const environmentSetup = new EnvironmentSetup();

  environmentSetup.insertDisk("df0", "/home/disk1.adf");
  expect(fs.chmodSync).toHaveBeenCalledTimes(1);
  const diskLocation = path.join(
    BASE_DIR,
    "execution",
    "20200401202930235",
    "df0.adf",
  );
  expect(fs.chmodSync).toHaveBeenCalledWith(diskLocation, 0o0777);
});

it("copies disks and sets permissions", () => {
  Date = vi.fn(
    () => new RealDate("2020-04-01T20:29:30.235Z"),
  ) as unknown as typeof Date;
  const environmentSetup = new EnvironmentSetup();
  const wbSourceLocation = "/home/os_disks/amiga-os-310-workbench.adf";
  const wbDestLocation = path.join(
    BASE_DIR,
    "execution",
    "20200401202930235",
    "df1.adf",
  );

  environmentSetup.insertDisk(
    "df1",
    "/home/os_disks/amiga-os-310-workbench.adf",
  );
  expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
  expect(fs.copyFileSync).toHaveBeenCalledWith(
    wbSourceLocation,
    wbDestLocation,
  );
  expect(fs.chmodSync).toHaveBeenCalledTimes(1);
  const diskLocation = path.join(
    BASE_DIR,
    "execution",
    "20200401202930235",
    "df1.adf",
  );
  expect(fs.chmodSync).toHaveBeenCalledWith(diskLocation, 0o0777);
});
