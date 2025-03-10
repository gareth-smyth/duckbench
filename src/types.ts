import EnvironmentSetup from "./builder/EnvironmentSetup";
import Communicator from "./builder/Communicator";
import PluginStore from "./builder/PluginStore";

export type PluginConfig = {
  type?: string;
  id?: string;
  name: string;
  optionValues?: Record<string, string>;
};

export type Settings = Record<string, Array<Record<string, string>>>;

export type PluginError = {
  type: string;
  text: string;
};

export type Plugin = {
  structure: () => Record<string, unknown>;
  prepare: (
    config: PluginConfig,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
  ) => Promise<void>;
  validate?: (
    config: PluginConfig,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
  ) => Array<PluginError>;
  install: (
    config: PluginConfig,
    communicator: Communicator,
    pluginStore: PluginStore,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
  ) => Promise<void>;
  finalise: (
    config: PluginConfig,
    environmentSetup: EnvironmentSetup,
  ) => Promise<void>;
};
