import EnvironmentSetup from "./builder/EnvironmentSetup";
import Communicator from "./builder/Communicator";
import PluginStore from "./builder/PluginStore";

export type PluginConfig = {
  type?: string;
  id?: string;
  name: string;
  optionValues?: Record<string, string>;
};

export type Settings = Record<string, Array<Record<string, unknown>>>;

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

export type AdfDefinition = {
  drive: string;
  location: string;
};

export type HdfDefinition = {
  drive: string;
  location: string;
};

export type CdDefinition = {
  location: string;
};

export type MappedDriveDefinition = {
  drive: string;
  location: string;
  name: string;
  writeable: boolean;
};

export type DiskDefinition = {
  location: string;
  type?: string;
  name?: string;
};

export type DiskSetup = {
  ADF: AdfDefinition[];
  HDF: HdfDefinition[];
  CD: CdDefinition[];
  MAPPED_DRIVE: MappedDriveDefinition[];
};

export type SocketControlNonDataEventMessages =
  | "CLOSE_EVENT"
  | "CONNECT_EVENT"
  | "READY_EVENT"
  | "COMMAND_RECEIVED";
export type SocketControlDataEventMessage = "DATA_EVENT";
export type SocketControlEvents =
  | SocketControlNonDataEventMessages
  | SocketControlDataEventMessage;

export type SocketControlNonDataEvent = {
  message: SocketControlNonDataEventMessages;
};

export type SocketControlDataEvent = {
  message: SocketControlDataEventMessage;
  data: string;
};

export type CommandCallBackMessage = "COMMAND_RECEIVED" | "DATA_EVENT";

export type SocketCommandCallBackEvent = {
  message: CommandCallBackMessage;
  data: string;
};
export type SocketControlCallBackEvent =
  | SocketControlNonDataEvent
  | SocketControlDataEvent;

export type SocketCommandCallback = (
  event?: SocketCommandCallBackEvent,
) => void;
export type SocketControlCallback = (
  event?: SocketControlCallBackEvent,
) => void;

export type CommandOptions = {
  REDIRECT_IN?: string;
  REDIRECT_OUT?: string;
} & Record<string, string | boolean>;

export type CommandExpectedResponse = RegExp | string | Array<RegExp | string>;
