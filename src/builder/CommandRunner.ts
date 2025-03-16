import Logger from "../services/LoggerService";
import SocketCommunicator from "./SocketCommunicator";
import {
  CommandExpectedResponse,
  CommandOptions,
  SocketCommandCallback,
} from "../types";

export default class CommandRunner {
  private readonly socketCommunicator;

  constructor(socketCommunicator: SocketCommunicator) {
    this.socketCommunicator = socketCommunicator;
  }

  /* istanbul ignore next */
  noCallback() {}

  async run(
    commandString: string,
    options?: CommandOptions,
    commandCallback: SocketCommandCallback = this.noCallback,
    expectedResponse?: CommandExpectedResponse,
  ) {
    commandString = this.addOptions(commandString, options);
    Logger.debug(`Running ${commandString}`);
    return this.socketCommunicator
      .runCommand(commandString, commandCallback)
      .then((response) => {
        if (this.checkResponse(expectedResponse, response)) {
          if (!expectedResponse) {
            throw new Error(
              `Expected no response from "${commandString}" but got "${response}"`,
            );
          } else {
            throw new Error(
              `Expected "${expectedResponse}" from "${commandString}" but got "${response}"`,
            );
          }
        }
        Logger.debug(`Ran ${commandString}`);
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  checkResponse(
    expectedResponse: CommandExpectedResponse | undefined,
    response: string[],
  ): boolean {
    if (expectedResponse) {
      return (
        response.length === 0 ||
        this.checkStringResponse(expectedResponse, response) ||
        this.checkRegExResponse(expectedResponse, response) ||
        this.checkMultipleResponses(expectedResponse, response)
      );
    } else {
      return response.length > 0;
    }
  }

  checkRegExResponse(
    expectedResponse: CommandExpectedResponse,
    response: string[],
  ) {
    return (
      expectedResponse instanceof RegExp &&
      !expectedResponse.test(response.join())
    );
  }

  checkStringResponse(
    expectedResponse: CommandExpectedResponse,
    response: string[],
  ) {
    return (
      typeof expectedResponse === "string" &&
      !response.join().includes(expectedResponse)
    );
  }

  checkMultipleResponses(
    expectedResponse: CommandExpectedResponse,
    response: string[],
  ) {
    return (
      Array.isArray(expectedResponse) &&
      expectedResponse.some((expectedSubResponse) => {
        return this.checkResponse(expectedSubResponse, response);
      })
    );
  }

  addOptions(command: string, options?: CommandOptions) {
    const redirectIn = options?.REDIRECT_IN;
    const redirectOut = options?.REDIRECT_OUT;

    options &&
      Object.keys(options)
        .filter(
          (optionKey) =>
            optionKey !== "REDIRECT_IN" && optionKey !== "REDIRECT_OUT",
        )
        .forEach((optionKey) => {
          const optionValue = options[optionKey];
          if (optionValue === true) {
            command = `${command} ${optionKey}`;
          } else {
            command = `${command} ${optionKey} ${optionValue}`;
          }
        });

    if (redirectIn) {
      command = `${command} < ${redirectIn}`;
    }

    if (redirectOut) {
      command = `${command} > ${redirectOut}`;
    }

    return command;
  }
}
