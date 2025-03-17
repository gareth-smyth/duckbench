import { copyFileSync, existsSync } from "fs";
import path from "path";
import { MockedObject, vi } from "vitest";

import Communicator from "../../builder/Communicator";
import { CACHE_DIR } from "../../services/BaseDirService";

vi.mock("../../../src/builder/Communicator");

import WinUAETools from "./index";

let communicator: MockedObject<Communicator>;
beforeEach(() => {
  communicator = vi.mocked(new Communicator());
});

const environmentSetup = {};
const settings = {
  Setup: [
    { name: "emulatorRoot", value: { folder: "c:/some_place/" } },
    { name: "rom310", value: { file: "some/place" } },
  ],
};

it("copies the tools to the cache when both not already there", async () => {
  vi.mocked(existsSync).mockReturnValueOnce(false).mockReturnValue(true);

  const winUAETools = new WinUAETools();
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "B:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );

  const emuRoot = "c:/some_place/";
  const ctrlPath = path.join(emuRoot, "Amiga Programs", "uaectrl");
  expect(copyFileSync).toHaveBeenCalledTimes(1);
  expect(copyFileSync).toHaveBeenCalledWith(
    ctrlPath,
    path.join(CACHE_DIR, "uaectrl"),
  );
});

it("copies the tools to the cache when either not already there", async () => {
  vi.mocked(existsSync)
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(false)
    .mockReturnValue(true);

  const winUAETools = new WinUAETools();
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "B:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );

  const emuRoot = "c:/some_place/";
  const ctrlPath = path.join(emuRoot, "Amiga Programs", "uaectrl");
  expect(copyFileSync).toHaveBeenCalledTimes(1);
  expect(copyFileSync).toHaveBeenCalledWith(
    ctrlPath,
    path.join(CACHE_DIR, "uaectrl"),
  );
});

it("does not copy the tools to the cache when both already exist", async () => {
  vi.mocked(existsSync).mockReturnValue(true);

  const winUAETools = new WinUAETools();
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "B:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );

  expect(copyFileSync).toHaveBeenCalledTimes(0);
});

it("copies the tools to the requested location", async () => {
  const winUAETools = new WinUAETools();
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "A:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );
  await winUAETools.install(
    { optionValues: { location: "B:" } },
    communicator,
    {},
    environmentSetup,
    settings,
  );

  expect(communicator.copy).toHaveBeenCalledTimes(2);
  expect(communicator.copy).toHaveBeenCalledWith("DB_HOST_CACHE:uaectrl", "A:");
  expect(communicator.copy).toHaveBeenCalledWith("DB_HOST_CACHE:uaectrl", "B:");
});
