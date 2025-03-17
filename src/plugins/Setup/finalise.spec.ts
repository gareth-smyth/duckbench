import { copyFileSync, writeFileSync } from "fs";
import EnvironmentSetup from "../../builder/EnvironmentSetup";
import Setup, { SetupPluginConfig } from "./index";

const config: SetupPluginConfig = { name: "Setup", type: "internal" };
const environmentSetup = {
  executionFolder: "/some_place/",
} as unknown as EnvironmentSetup;

it("doesn't do anything if outputFolder is not set", () => {
  const setup = new Setup();
  setup.finalise(config, environmentSetup, {
    Setup: [],
  });

  expect(copyFileSync).not.toHaveBeenCalled();
  expect(writeFileSync).not.toHaveBeenCalled();
});

it("copies the new hard drive if outputFolder is set", () => {
  const setup = new Setup();
  setup.finalise(config, environmentSetup, {
    Setup: [{ name: "outputFolder", value: "/my_folder" }],
  });

  expect(copyFileSync).toHaveBeenCalledWith(
    "/some_place/NewWorkbench.hdf",
    "/my_folder/NewWorkbench.hdf",
  );
  expect(writeFileSync).not.toHaveBeenCalled();
});

it("copies the new hard drive and outputs a config if outputFolder and outputConfig is set", () => {
  const setup = new Setup();
  setup.finalise(config, environmentSetup, {
    Setup: [
      { name: "outputFolder", value: "/my_folder" },
      { name: "outputConfig", value: "Yes" },
      { name: "emulator", value: "/winuae" },
    ],
  });

  expect(copyFileSync).toHaveBeenCalledWith(
    "/some_place/NewWorkbench.hdf",
    "/my_folder/NewWorkbench.hdf",
  );
  expect(writeFileSync).toHaveBeenCalledWith(
    "/my_folder/config.uae",
    expect.stringContaining("# Win-UAE config created by DuckBench"),
  );
});
