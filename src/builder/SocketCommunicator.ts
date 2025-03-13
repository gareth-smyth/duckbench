/* eslint-disable no-useless-escape */
import net from "net";
import Logger from "../services/LoggerService";
import { SocketCommandCallback, SocketControlCallback } from "../types";

type SocketStatus =
  | "SEND_COMMAND"
  | "CONNECTED"
  | "CONNECTING"
  | "COMMAND_RUNNING";

export default class SocketCommunicator {
  private readonly client: net.Socket = new net.Socket();
  private currentLine: string = "";
  private commandRunning: string = "";
  private runningCommandData: string[] = [];
  private lastCharLF: boolean = false;
  private status?: SocketStatus;

  private readonly controlCallback: SocketControlCallback =
    SocketCommunicator.noCallback;
  private commandCallback: SocketCommandCallback =
    SocketCommunicator.noCallback;
  private runningCommandResolve?: (
    value: string[] | PromiseLike<string[]>,
  ) => void;
  private connectedResolve?: (value: unknown | PromiseLike<unknown>) => void;

  constructor(controlCallback?: SocketControlCallback) {
    this.controlCallback = controlCallback || this.controlCallback;
    this.client.on("data", this._dataEvent.bind(this));
    this.client.on("close", this._closeEvent.bind(this));
    this.client.on("connect", this._connectEvent.bind(this));
    this.client.on("ready", this._readyEvent.bind(this));
  }

  static noCallback(): void {}

  async runCommand(
    commandString: string,
    commandCallback = SocketCommunicator.noCallback,
  ): Promise<string[]> {
    this.commandRunning = `${commandString}`;
    this.commandCallback = commandCallback;
    this.status = "SEND_COMMAND";
    Logger.debug(
      `I am running the command "${commandString.trim()}" on the Amiga`,
    );
    this.client.write(`${commandString}\r`);
    this.runningCommandData = [];
    return new Promise((resolve) => {
      this.runningCommandResolve = resolve;
    });
  }

  close() {
    this.client.destroy();
  }

  _dataEvent(data: object) {
    Logger.trace(`Got data ${JSON.stringify(data.toString())}`);
    const dataString = data.toString();

    for (let charIdx = 0; charIdx <= dataString.length; charIdx++) {
      const char = dataString.charAt(charIdx);
      this.currentLine += char;
      if (
        ((char === "\n" || char === "\r") && this.lastCharLF) ||
        this._responseIsPrompt(this.currentLine)
      ) {
        this._processResponse(this.currentLine.replace("\n\r", ""));
        this.currentLine = "";
        this.lastCharLF = false;
      } else if (char === "\n" || char === "\r") {
        this.lastCharLF = true;
      }
    }
  }

  _closeEvent() {
    this.controlCallback({ message: "CLOSE_EVENT" });
    Logger.debug("The Amiga has closed the connection");
  }

  _connectEvent() {
    this.controlCallback({ message: "CONNECT_EVENT" });
    Logger.debug("I am connected to the Amiga");
  }

  _readyEvent() {
    this.controlCallback({ message: "READY_EVENT" });
    Logger.debug("I have opened communication with the Amiga");
  }

  connect() {
    const connectingPromise = new Promise((resolve) => {
      this.status = "CONNECTING";
      this.connectedResolve = resolve;
    });
    this.client.connect(8055, "127.0.0.1");
    return connectingPromise;
  }

  _processResponse(responseLine: string) {
    Logger.trace(
      `While status is ${this.status} I got ${JSON.stringify(responseLine)}`,
    );

    switch (this.status) {
      case "CONNECTING":
        if (this._responseIsPrompt(responseLine)) {
          Logger.debug("I have communication with the Amiga.");
          this.status = "CONNECTED";
          setTimeout(() => this.connectedResolve?.(undefined), 1000);
        } else {
          this.controlCallback({ message: "DATA_EVENT", data: responseLine });
          Logger.debug(
            `While connecting I got this message: ${JSON.stringify(responseLine)}`,
          );
        }
        break;
      case "CONNECTED":
        this.controlCallback({ message: "DATA_EVENT", data: responseLine });
        throw Error(
          "While connected but not waiting on a command to finish I got this " +
            `message: ${JSON.stringify(responseLine)}`,
        );
      case "SEND_COMMAND":
        if (responseLine.match(this._escapeRegex(this.commandRunning))) {
          this.status = "COMMAND_RUNNING";
          this.commandCallback({
            message: "COMMAND_RECEIVED",
            data: responseLine,
          });
          Logger.debug(
            `The Amiga is executing the command "${this.commandRunning.trim()}"` +
              " and I am waiting for the response.",
          );
        } else {
          this.controlCallback({ message: "DATA_EVENT", data: responseLine });
          throw Error(
            `I ran the command "${this.commandRunning.trim()}" and have received the response ` +
              `${JSON.stringify(responseLine)} but I expected an echo`,
          );
        }
        break;
      case "COMMAND_RUNNING":
        if (this._responseIsPrompt(responseLine)) {
          Logger.debug(
            `I ran the command "${this.commandRunning.trim()}" and it has returned the values ` +
              `\r\n---\r\n${this.runningCommandData.join("\r\n")}\r\n---`,
          );
          Logger.debug(
            `I ran the command ${this.commandRunning.trim()} and it completed.`,
          );
          this.status = "CONNECTED";
          setTimeout(() => {
            this.runningCommandResolve?.(this.runningCommandData);
            this.runningCommandData = [];
          }, 1000);
        } else {
          this.commandCallback({ message: "DATA_EVENT", data: responseLine });
          Logger.trace(
            `I ran the command ${this.commandRunning.trim()} and have received the ` +
              `response ${JSON.stringify(responseLine)}`,
          );
          this.runningCommandData.push(responseLine);
        }
        break;
    }
  }

  _responseIsPrompt(responseLine: string) {
    // eslint-disable-next-line no-control-regex
    return responseLine.match(/\d\..*>/);
  }

  _escapeRegex(string: string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
}
