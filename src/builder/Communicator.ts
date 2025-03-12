import CommandBuilder from "./CommandRunner";
import SocketCommunicator from "./SocketCommunicator";
import {
  CommandExpectedResponse,
  CommandOptions,
  SocketCommandCallback,
  SocketControlCallback,
} from "../types";

export default class Communicator {
  private readonly commandRunner;
  private readonly socketCommunicator;

  /* istanbul ignore next */
  constructor(
    controlCallback: SocketControlCallback = this.noCallback,
    socketCommunicator = new SocketCommunicator(controlCallback),
    commandRunner = new CommandBuilder(socketCommunicator),
  ) {
    this.commandRunner = commandRunner;
    this.socketCommunicator = socketCommunicator;
  }

  /* istanbul ignore next */
  noCallback() {}

  async run(
    commandString: string,
    options: CommandOptions,
    commandCallback: SocketCommandCallback,
    expectedResponse: CommandExpectedResponse,
  ) {
    return this.commandRunner.run(
      commandString,
      options,
      commandCallback,
      expectedResponse,
    );
  }

  async assign(
    name: string,
    folder: string,
    options: CommandOptions,
    commandCallback: SocketCommandCallback = this.noCallback,
    expectedResponse?: CommandExpectedResponse,
  ) {
    return this.commandRunner.run(
      `assign ${name} ${folder}`,
      options,
      commandCallback,
      expectedResponse,
    );
  }

  async cd(
    folder: string,
    options: CommandOptions = {},
    commandCallback: SocketCommandCallback = this.noCallback,
  ) {
    return this.commandRunner.run(`cd ${folder}`, options, commandCallback);
  }

  async copy(
    source: string,
    destination: string,
    options: CommandOptions = {},
    commandCallback: SocketCommandCallback = this.noCallback,
    expectedResponse?: CommandExpectedResponse,
  ) {
    return this.commandRunner.run(
      `copy ${source} ${destination}`,
      options,
      commandCallback,
      expectedResponse,
    );
  }

  async delete(
    filename: string,
    options: CommandOptions,
    commandCallback: SocketCommandCallback = this.noCallback,
    expectedResponse: CommandExpectedResponse = `${filename}  Deleted`,
  ) {
    return this.commandRunner.run(
      `delete ${filename}`,
      options,
      commandCallback,
      expectedResponse,
    );
  }

  async echo(
    content: string,
    options: CommandOptions,
    commandCallback: SocketCommandCallback = this.noCallback,
  ) {
    return this.commandRunner.run(
      `echo "${content}"`,
      options,
      commandCallback,
    );
  }

  async format(
    drive: string,
    volumeName: string,
    options: CommandOptions = {},
    commandCallback: SocketCommandCallback = this.noCallback,
  ) {
    const commandString = `format drive ${drive} name ${volumeName}`;
    const expectedResponse = /^((?!Format Failure).)*$/;
    return this.commandRunner.run(
      commandString,
      options,
      commandCallback,
      expectedResponse,
    );
  }

  async makedir(
    folder: string,
    options: CommandOptions = {},
    commandCallback: SocketCommandCallback = this.noCallback,
  ) {
    return this.commandRunner.run(
      `makedir ${folder}`,
      options,
      commandCallback,
    );
  }

  async path(
    folder: string,
    options: CommandOptions = {},
    commandCallback: SocketCommandCallback = this.noCallback,
  ) {
    return this.commandRunner.run(`path ${folder}`, options, commandCallback);
  }

  async protect(
    filename: string,
    options: CommandOptions = {},
    commandCallback: SocketCommandCallback = this.noCallback,
    expectedResponse?: CommandExpectedResponse,
  ) {
    return this.commandRunner.run(
      `protect ${filename}`,
      options,
      commandCallback,
      expectedResponse,
    );
  }

  close() {
    this.socketCommunicator.close();
  }

  connect() {
    return this.socketCommunicator.connect();
  }
}
