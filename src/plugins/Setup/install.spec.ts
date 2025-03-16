import Communicator from "../../builder/Communicator.js";
import PluginStore from "../../builder/PluginStore";
import RedirectInputFile from "../RedirectInputFile";

import Setup, { SetupPluginConfig } from "./index.js";
import { MockedObject, vi } from "vitest";

vi.mock("../../../src/builder/Communicator");
vi.mock("../../../src/builder/PluginStore");
vi.mock("../../../src/plugins/RedirectInputFile");

let communicator: MockedObject<Communicator>;
let pluginStore: MockedObject<PluginStore>;
let mockRedirectInputFile: MockedObject<RedirectInputFile>;

const config: SetupPluginConfig = { name: "Setup", type: "internal" };

beforeEach(() => {
  communicator = vi.mocked(new Communicator());
  pluginStore = vi.mocked(new PluginStore());
  mockRedirectInputFile = vi.mocked(new RedirectInputFile());
  pluginStore.getPlugin.mockReturnValue(mockRedirectInputFile);
  mockRedirectInputFile.createInput.mockResolvedValueOnce("ram:some file.txt");
});

it("installs the hit enter file", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(mockRedirectInputFile.createInput).toHaveBeenCalledWith(
    [""],
    communicator,
  );
});

it("installs the duckbench partition", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.format).toHaveBeenCalledWith("DB0", "DUCKBENCH", {
    ffs: true,
    quick: true,
    intl: true,
    noicons: true,
    REDIRECT_IN: "ram:some file.txt",
  });
});

it("installs the cache partition when does not exist", async () => {
  communicator.assign.mockResolvedValueOnce();
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.format).toHaveBeenCalledTimes(2);
  expect(communicator.format).toHaveBeenCalledWith("DB1", "DB_CLIENT_CACHE", {
    ffs: true,
    quick: true,
    intl: true,
    noicons: true,
    REDIRECT_IN: "ram:some file.txt",
  });
});

it("installs the cache partition when does not exist", async () => {
  communicator.assign.mockImplementationOnce(() => {
    throw new Error("assign error");
  });
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.format).toHaveBeenCalledTimes(1);
});

it("makes duckbench:c folder", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.makedir).toHaveBeenCalledTimes(4);
  expect(communicator.makedir).toHaveBeenCalledWith("duckbench:c");
});

it("makes duckbench:envarc folder", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.makedir).toHaveBeenCalledTimes(4);
  expect(communicator.makedir).toHaveBeenCalledWith("duckbench:envarc");
});

it("adds duckbench:c to the path", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.path).toHaveBeenCalledTimes(1);
  expect(communicator.path).toHaveBeenCalledWith("duckbench:c", { ADD: true });
});

it("makes duckbench:t folder", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.makedir).toHaveBeenCalledTimes(4);
  expect(communicator.makedir).toHaveBeenCalledWith("duckbench:t");
});

it("assigns t: to the duckbench:t folder", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.assign).toHaveBeenCalledWith("t:", "duckbench:t");
});

it("assigns envarc: to the duckbench:envarc folder", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.assign).toHaveBeenCalledWith(
    "envarc:",
    "duckbench:envarc",
  );
});

it("makes duckbench:disks folder", async () => {
  const setup = new Setup();
  await setup.install(config, communicator, pluginStore);

  expect(communicator.makedir).toHaveBeenCalledTimes(4);
  expect(communicator.makedir).toHaveBeenCalledWith("duckbench:disks");
});
