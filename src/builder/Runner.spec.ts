import PluginStore from "./PluginStore";
import type { Plugin, PluginConfig, Settings } from "../types";

vi.mock("../../src/builder/PluginStore");

const mockPluginStoreInstance = {
  hasPlugin: vi.fn(),
  create: vi.fn(),
  add: vi.fn(),
  getPlugin: vi.fn(),
} as MockedObject<PluginStore>;

beforeEach(() => {
  vi.mocked(PluginStore).mockImplementation(() => mockPluginStoreInstance);
});

import Runner from "./Runner";
import { MockedObject, vi } from "vitest";
import EnvironmentSetup from "./EnvironmentSetup";
import Communicator from "./Communicator";
import Setup from "../plugins/Setup";

describe("setupAndConfigure", () => {
  it("adds all passed in configs", async () => {
    mockPluginStoreInstance.create.mockResolvedValue({});
    const runner = new Runner();

    await runner.configureAndSetup([
      { name: "config a" },
      { name: "config b" },
    ]);

    expect(runner.configs.length).toEqual(2);
    expect(runner.configs[0]).toEqual({ name: "config a" });
    expect(runner.configs[1]).toEqual({ name: "config b" });
  });

  it("adds the setup config", async () => {
    mockPluginStoreInstance.create.mockResolvedValue({});
    const runner = new Runner();

    await runner.configureAndSetup([
      { name: "config a" },
      { name: "config b" },
    ]);

    expect(runner.setupConfig).toEqual({ name: "Setup", type: "internal" });
  });

  it("adds the setup plugin", async () => {
    mockPluginStoreInstance.create.mockResolvedValue({ name: "SetupPlugin" });
    const runner = new Runner();

    await runner.configureAndSetup([
      { name: "config a" },
      { name: "config b" },
    ]);

    expect(runner.setupPlugin).toEqual({ name: "SetupPlugin" });
    expect(mockPluginStoreInstance.add).toHaveBeenCalledWith("Setup", {
      name: "SetupPlugin",
    });
  });

  it("adds child configs", async () => {
    mockPluginStoreInstance.create.mockImplementation(async (pluginName) => {
      if ("a" === pluginName) {
        return { configure: () => [{ name: "c" }, { name: "d" }] };
      } else if ("c" === pluginName) {
        return { configure: () => [{ name: "e" }, { name: "f" }] };
      } else {
        return { configure: () => [] };
      }
    });
    const runner = new Runner();

    await runner.configureAndSetup([{ name: "a" }, { name: "b" }]);

    expect(runner.configs.length).toEqual(6);
    expect(runner.configs[0]).toEqual({ name: "e" });
    expect(runner.configs[1]).toEqual({ name: "f" });
    expect(runner.configs[2]).toEqual({ name: "c" });
    expect(runner.configs[3]).toEqual({ name: "d" });
    expect(runner.configs[4]).toEqual({ name: "a" });
    expect(runner.configs[5]).toEqual({ name: "b" });
  });

  it("adds plugins to the store", async () => {
    mockPluginStoreInstance.create.mockImplementation(async (pluginName) => {
      if ("a" === pluginName) {
        return {
          name: pluginName,
          configure: () => [{ name: "c" }, { name: "d" }],
        };
      } else if ("c" === pluginName) {
        return {
          name: pluginName,
          configure: () => [{ name: "e" }, { name: "f" }],
        };
      } else {
        return { name: pluginName };
      }
    });
    const runner = new Runner();

    await runner.configureAndSetup([{ name: "a" }, { name: "b" }]);

    expect(mockPluginStoreInstance.add).toHaveBeenCalledTimes(7);
    expect(mockPluginStoreInstance.add).toHaveBeenCalledWith("a", {
      name: "a",
      configure: expect.any(Function),
    });
    expect(mockPluginStoreInstance.add).toHaveBeenCalledWith("b", {
      name: "b",
    });
    expect(mockPluginStoreInstance.add).toHaveBeenCalledWith("c", {
      name: "c",
      configure: expect.any(Function),
    });
    expect(mockPluginStoreInstance.add).toHaveBeenCalledWith("d", {
      name: "d",
    });
    expect(mockPluginStoreInstance.add).toHaveBeenCalledWith("e", {
      name: "e",
    });
    expect(mockPluginStoreInstance.add).toHaveBeenCalledWith("f", {
      name: "f",
    });
  });

  it("only adds child configs once ", async () => {
    mockPluginStoreInstance.create
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        configure: () => [{ name: "config c" }, { name: "config d" }],
      })
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        configure: () => [{ name: "config c" }, { name: "config d" }],
      });
    mockPluginStoreInstance.hasPlugin
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const runner = new Runner();

    await runner.configureAndSetup([
      { name: "config a" },
      { name: "config b" },
    ]);

    expect(runner.configs.length).toEqual(4);
    expect(runner.configs[0]).toEqual({ name: "config c" });
    expect(runner.configs[1]).toEqual({ name: "config d" });
    expect(runner.configs[2]).toEqual({ name: "config a" });
    expect(runner.configs[3]).toEqual({ name: "config b" });
  });
});

describe("validate", () => {
  it("throws an error if validate is called before configure and setup", () => {
    const runner = new Runner();
    const env = {} as unknown as EnvironmentSetup;
    expect(() => runner.validate(env, {})).toThrow(
      "configureAndSetup must be called before validate",
    );
  });

  it("calls validate on all configs with a validate method", () => {
    const validateFunc1 = vi.fn().mockReturnValueOnce([]);
    const validateFunc2 = vi.fn().mockReturnValueOnce([]);
    const setupValidateFunc = vi.fn().mockReturnValueOnce([]);
    mockPluginStoreInstance.getPlugin
      .mockReturnValueOnce({
        validate: validateFunc1,
      } as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({} as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({
        validate: validateFunc2,
      } as unknown as Plugin<PluginConfig>);

    const runner = new Runner();
    runner.configs = [{ name: "a" }, { name: "b" }, { name: "c" }];
    runner.setupConfig = { name: "Setup", type: "internal" };
    runner.setupPlugin = {
      validate: setupValidateFunc,
    } as unknown as Setup;
    const env = {} as unknown as EnvironmentSetup;
    runner.validate(env, {});

    expect(validateFunc1).toHaveBeenCalledTimes(1);
    expect(validateFunc1).toHaveBeenCalledWith({ name: "a" }, env, {});
    expect(validateFunc2).toHaveBeenCalledTimes(1);
    expect(validateFunc2).toHaveBeenCalledWith({ name: "c" }, env, {});
    expect(setupValidateFunc).toHaveBeenCalledTimes(1);
    expect(setupValidateFunc).toHaveBeenCalledWith(
      { name: "Setup", type: "internal" },
      env,
      {},
    );
  });

  it("throws an error when a plugin returns a validation error", () => {
    const validateFunc1 = vi.fn().mockReturnValueOnce([{ err: "an error" }]);
    const validateFunc2 = vi.fn().mockReturnValueOnce([]);
    const setupValidateFunc = vi.fn().mockReturnValueOnce([]);
    mockPluginStoreInstance.getPlugin
      .mockReturnValueOnce({
        validate: validateFunc1,
      } as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({} as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({
        validate: validateFunc2,
      } as unknown as Plugin<PluginConfig>);

    const runner = new Runner();
    runner.configs = [{ name: "a" }, { name: "b" }, { name: "c" }];
    runner.setupConfig = { name: "Setup", type: "internal" };
    runner.setupPlugin = {
      validate: setupValidateFunc,
    } as unknown as Setup;
    const env = {} as unknown as EnvironmentSetup;

    expect(() => runner.validate(env, {})).toThrow();
  });
});

describe("prepare", () => {
  it("calls prepare on all configs with a prepare method", async () => {
    const prepareFunc1 = vi.fn();
    const prepareFunc2 = vi.fn();
    mockPluginStoreInstance.getPlugin
      .mockReturnValueOnce({
        prepare: prepareFunc1,
      } as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({} as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({
        prepare: prepareFunc2,
      } as unknown as Plugin<PluginConfig>);

    const runner = new Runner();
    runner.configs = [{ name: "a" }, { name: "b" }, { name: "c" }];
    runner.setupPlugin = {
      prepare: vi.fn(),
    } as unknown as Setup;
    const env = {} as unknown as EnvironmentSetup;
    await runner.prepare(env, {});

    expect(prepareFunc1).toHaveBeenCalledTimes(1);
    expect(prepareFunc1).toHaveBeenCalledWith({ name: "a" }, env, {});
    expect(prepareFunc2).toHaveBeenCalledTimes(1);
    expect(prepareFunc2).toHaveBeenCalledWith({ name: "c" }, env, {});
  });

  it("calls prepare on all configs with a setup plugin", async () => {
    const runner = new Runner();
    runner.configs = [];
    runner.setupConfig = { name: "Setup", type: "internal" };
    runner.setupPlugin = {
      prepare: vi.fn(),
    } as unknown as Setup;
    const env = {} as unknown as EnvironmentSetup;
    await runner.prepare(env, {});

    expect(runner.setupPlugin.prepare).toHaveBeenCalledTimes(1);
    expect(runner.setupPlugin.prepare).toHaveBeenCalledWith(
      { name: "Setup", type: "internal" },
      env,
      {},
    );
  });
});

describe("install", () => {
  it("calls install on all plugins with a install method", async () => {
    const installFunc1 = vi.fn();
    const installFunc2 = vi.fn();
    mockPluginStoreInstance.getPlugin
      .mockReturnValueOnce({
        install: installFunc1,
      } as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({} as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({
        install: installFunc2,
      } as unknown as Plugin<PluginConfig>);

    const runner = new Runner();
    runner.configs = [{ name: "a" }, { name: "b" }, { name: "c" }];
    runner.setupConfig = { name: "Setup", type: "internal" };
    runner.setupPlugin = {
      install: vi.fn(),
    } as unknown as Setup;
    const communicator = {} as unknown as Communicator;
    const environmentSetup = {} as unknown as EnvironmentSetup;
    await runner.install(communicator, environmentSetup, {});

    expect(installFunc1).toHaveBeenCalledTimes(1);
    expect(installFunc1).toHaveBeenCalledWith(
      { name: "a" },
      communicator,
      mockPluginStoreInstance,
      environmentSetup,
      {},
    );
    expect(installFunc2).toHaveBeenCalledTimes(1);
    expect(installFunc2).toHaveBeenCalledWith(
      { name: "c" },
      communicator,
      mockPluginStoreInstance,
      environmentSetup,
      {},
    );
  });

  it("calls install on the setup plugin", async () => {
    const runner = new Runner();
    runner.configs = [];
    runner.setupConfig = { name: "Setup", type: "internal" };
    runner.setupPlugin = {
      install: vi.fn(),
    } as unknown as Setup;
    const communicator = {} as unknown as Communicator;
    const environmentSetup = {} as unknown as EnvironmentSetup;
    await runner.install(communicator, environmentSetup, {});

    expect(runner.setupPlugin.install).toHaveBeenCalledTimes(1);
    expect(runner.setupPlugin.install).toHaveBeenCalledWith(
      { name: "Setup", type: "internal" },
      communicator,
      mockPluginStoreInstance,
    );
  });
});

describe("finalise", () => {
  it("calls finalise on all plugins with a finalise method", async () => {
    const finaliseFunc1 = vi.fn();
    const finaliseFunc2 = vi.fn();
    mockPluginStoreInstance.getPlugin
      .mockReturnValueOnce({
        finalise: finaliseFunc1,
      } as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({} as unknown as Plugin<PluginConfig>)
      .mockReturnValueOnce({
        finalise: finaliseFunc2,
      } as unknown as Plugin<PluginConfig>);

    const runner = new Runner();
    runner.configs = [{ name: "a" }, { name: "b" }, { name: "c" }];
    const env = {} as unknown as EnvironmentSetup;
    await runner.finalise(env, {} as unknown as Settings);

    expect(finaliseFunc1).toHaveBeenCalledTimes(1);
    expect(finaliseFunc1).toHaveBeenCalledWith({ name: "a" }, env);
    expect(finaliseFunc2).toHaveBeenCalledTimes(1);
    expect(finaliseFunc2).toHaveBeenCalledWith({ name: "c" }, env);
  });
});
