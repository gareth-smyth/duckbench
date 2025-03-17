import EnvironmentSetup from "./builder/EnvironmentSetup";
import Communicator from "./builder/Communicator";
import PluginStore from "./builder/PluginStore";

export type PluginConfig = {
  type?: string;
  id?: string;
  name: string;
  optionValues?: Record<string, unknown>;
};

export type Settings = Record<string, Array<Record<string, unknown>>>;

export type PluginError = {
  type: string;
  text: string;
};

export type Plugin<PluginConfigType extends PluginConfig> = {
  structure: () => Record<string, unknown>;
  prepare?: (
    config: PluginConfigType,
    environmentSetup: EnvironmentSetup,
    settings?: Settings,
  ) => Promise<void>;
  validate?: (
    config: PluginConfigType,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
  ) => Array<PluginError>;
  install?: (
    config: PluginConfigType,
    communicator: Communicator,
    pluginStore: PluginStore,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
  ) => Promise<void>;
  finalise?: (
    config: PluginConfigType,
    environmentSetup: EnvironmentSetup,
    settings?: Settings,
  ) => Promise<void>;
};

export type HdfDefinition = {
  drive: string;
  location: string;
  name?: string;
};

export type MappedDriveDefinition = {
  drive?: string;
  location: string;
  name?: string;
  writeable?: boolean;
};

export type DiskSetup = {
  ADF: string[];
  HDF: HdfDefinition[];
  CD: string[];
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

export type AmigaModel =
  | "A1000"
  | "A1500"
  | "A2000"
  | "A3000"
  | "A4000"
  | "A500"
  | "A500+"
  | "A600"
  | "A1200"
  | "CDTV"
  | "CD32";

export type CPU =
  | "68000"
  | "68010"
  | "68EC020"
  | "68020"
  | "68EC030"
  | "68030"
  | "68EC040"
  | "68LC040"
  | "68040-NOMMU"
  | "68040"
  | "68EC060"
  | "68LC060"
  | "68060-NOMMU"
  | "68060";

export type Kickstart =
  | "1.0"
  | "1.1"
  | "1.2"
  | "1.3"
  | "1.4"
  | "2.04"
  | "2.05"
  | "3.0"
  | "3.1"
  | "3.2";

export type Chipset = "OCS" | "ECS" | "AGA";

export interface AmigaDefinition {
  model: AmigaModel;
  cpu: CPU;
  fastMemory: number;
  kickstart: Kickstart;
  chipMemory: number;
  chipset: Chipset;
}

export type Amiga = {
  definition: AmigaDefinition;
  disks: DiskSetup;
};

export type EmulatorSettings = {
  kickstarts: { [k in Kickstart]?: string };
};

export type EmulatorType = "WinUAE" | "FS-UAE" | "Amiberry";
