import { Socket } from "net";
vi.mock("net");

import SocketCommunicator from "../../src/builder/SocketCommunicator";
import { MockedObject, vi } from "vitest";
import {
  SocketCommandCallback,
  SocketCommandCallBackEvent,
  SocketControlCallback,
  SocketControlCallBackEvent,
  SocketControlDataEvent,
} from "../../src/types";

// As some functionality resolves promises with setTimeout we need to fake time passing and promise resolution cycle
async function flushTimeoutsAndPromises() {
  vi.runAllTimers();
  await Promise.resolve();
}

const mockedSocket = Socket as unknown as MockedObject<typeof Socket>;

type MockSocket = Socket & {
  eventFunctions: Record<string, (data: string) => void>;
};
let mockSocket: MockSocket;
beforeEach(() => {
  vi.useFakeTimers();
  mockSocket = {
    eventFunctions: {},
    destroy: vi.fn(),
    on: vi.fn(
      (event: string, func: (...args: unknown[]) => void): MockSocket => {
        mockSocket.eventFunctions[event] = func;
        return mockSocket;
      },
    ),
    connect: vi.fn(),
    write: vi.fn(),
  } as unknown as MockSocket;
  vi.mocked(mockedSocket).mockImplementation(() => mockSocket);
});

it("attaches methods to the client event emitter", () => {
  new SocketCommunicator();
  expect(mockSocket.on).toHaveBeenCalledTimes(4);
  expect(mockSocket.on).toHaveBeenCalledWith("data", expect.any(Function));
  expect(mockSocket.on).toHaveBeenCalledWith("close", expect.any(Function));
  expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
  expect(mockSocket.on).toHaveBeenCalledWith("ready", expect.any(Function));
});

it("destroys the client when close is called", () => {
  const communicator = new SocketCommunicator();
  communicator.close();
  expect(mockSocket.destroy).toHaveBeenCalledTimes(1);
});

it("resolves connection when a prompt is sent over the socket", async () => {
  const communicator = new SocketCommunicator();
  const connectionPromise = communicator.connect();

  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();
  expect(mockSocket.connect).toHaveBeenCalledTimes(1);
  expect(mockSocket.connect).toHaveBeenCalledWith(1234, "127.0.0.1");

  return connectionPromise;
});

it('resolves connection when a prompt is sent over the socket in two "packets"', async () => {
  const communicator = new SocketCommunicator();
  const connectionPromise = communicator.connect();

  mockSocket.eventFunctions.data("2.A Pr");
  mockSocket.eventFunctions.data("ompt>");
  await flushTimeoutsAndPromises();
  expect(mockSocket.connect).toHaveBeenCalledTimes(1);
  expect(mockSocket.connect).toHaveBeenCalledWith(1234, "127.0.0.1");

  return connectionPromise;
});

it("does not resolve the connection until a prompt is received", async () => {
  const communicator = new SocketCommunicator();
  let connectionResolved = false;
  communicator.connect().then(() => {
    connectionResolved = true;
  });

  // missing the the last ">" so doesn't count as a prompt
  mockSocket.eventFunctions.data("2. Not quite a prompt\n\r");
  await flushTimeoutsAndPromises();
  expect(connectionResolved).toEqual(false);

  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();
  expect(connectionResolved).toEqual(true);
});

it("calls the control callback when a close event is received", async () => {
  let closeEvent: SocketControlCallBackEvent | undefined = undefined;
  const controlCallback: SocketControlCallback = (
    event: SocketControlCallBackEvent | undefined,
  ) => {
    closeEvent = event;
  };
  new SocketCommunicator(controlCallback);

  mockSocket.eventFunctions.close("");
  await flushTimeoutsAndPromises();
  expect(closeEvent!.message).toEqual("CLOSE_EVENT");
});

it("calls the control callback when a connect event is received", async () => {
  let connectEvent: SocketControlCallBackEvent | undefined = undefined;
  const controlCallback = (event: SocketControlCallBackEvent | undefined) => {
    connectEvent = event;
  };
  new SocketCommunicator(controlCallback);

  mockSocket.eventFunctions.connect("");
  await flushTimeoutsAndPromises();
  expect(connectEvent!.message).toEqual("CONNECT_EVENT");
});

it("calls the control callback when a ready event is received", async () => {
  let readyEvent: SocketControlCallBackEvent | undefined = undefined;
  const controlCallback = (event: SocketControlCallBackEvent | undefined) => {
    readyEvent = event;
  };
  new SocketCommunicator(controlCallback);

  mockSocket.eventFunctions.ready("");
  await flushTimeoutsAndPromises();
  expect(readyEvent!.message).toEqual("READY_EVENT");
});

it("calls the control callback when output is received without sending a command", async () => {
  let dataEvent: SocketControlDataEvent | undefined = undefined;
  const controlCallback = (event: SocketControlDataEvent | undefined) => {
    dataEvent = event;
  };
  const communicator = new SocketCommunicator(
    controlCallback as SocketControlCallback,
  );
  // noinspection ES6MissingAwait
  communicator.connect();

  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();

  expect(() =>
    mockSocket.eventFunctions.data("This is the sent line\n\r"),
  ).toThrow(
    "While connected but not waiting on a command to finish I got this message: " +
      '"This is the sent line"',
  );
  await flushTimeoutsAndPromises();
  expect(dataEvent!.message).toEqual("DATA_EVENT");
  expect(dataEvent!.data).toEqual("This is the sent line");
});

it("calls the control callback when a command has been sent but not yet received the echo", async () => {
  let dataEvent: SocketControlDataEvent | undefined = undefined;
  const controlCallback = (event: SocketControlDataEvent | undefined) => {
    dataEvent = event;
  };
  const communicator = new SocketCommunicator(
    controlCallback as SocketControlCallback,
  );
  // noinspection ES6MissingAwait
  communicator.connect();
  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();

  // noinspection ES6MissingAwait
  communicator.runCommand("copy afile adir");
  await flushTimeoutsAndPromises();

  expect(() =>
    mockSocket.eventFunctions.data("This is the sent line\n\r"),
  ).toThrow(
    'I ran the command "copy afile adir" and have received the response "This is the sent line" ' +
      "but I expected an echo",
  );
  await flushTimeoutsAndPromises();
  expect(dataEvent!.message).toEqual("DATA_EVENT");
  expect(dataEvent!.data).toEqual("This is the sent line");
});

it("calls the control callback when a command has been sent but not yet received the echo", async () => {
  let dataEvent: SocketControlDataEvent | undefined = undefined;
  const controlCallback = (event: SocketControlDataEvent | undefined) => {
    dataEvent = event;
  };
  const communicator = new SocketCommunicator(
    controlCallback as SocketControlCallback,
  );
  communicator.connect();
  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();

  communicator.runCommand("copy afile adir");
  await flushTimeoutsAndPromises();

  expect(() =>
    mockSocket.eventFunctions.data("This is the sent line\n\r"),
  ).toThrow(
    'I ran the command "copy afile adir" and have received the response "This is the sent line" ' +
      "but I expected an echo",
  );
  await flushTimeoutsAndPromises();
  expect(dataEvent!.message).toEqual("DATA_EVENT");
  expect(dataEvent!.data).toEqual("This is the sent line");
});

it("calls the command callback when a command has been sent and echoed but not completed", async () => {
  let commandEvent: SocketCommandCallBackEvent | undefined = undefined;
  const commandCallback = (event: SocketCommandCallBackEvent | undefined) => {
    commandEvent = event;
  };
  const communicator = new SocketCommunicator();
  communicator.connect();
  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();

  communicator.runCommand(
    "copy afile adir",
    commandCallback as SocketCommandCallback,
  );
  await flushTimeoutsAndPromises();

  mockSocket.eventFunctions.data("copy afile adir\n\r");
  await flushTimeoutsAndPromises();
  expect(commandEvent!.message).toEqual("COMMAND_RECEIVED");
  expect(commandEvent!.data).toEqual("copy afile adir");
});

it("resolves the command promise with sent data when a new prompt is received", async () => {
  let resolvedData: string[] = [];
  const communicator = new SocketCommunicator();
  communicator.connect();
  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();

  communicator.runCommand("copy afile adir").then((data: string[]) => {
    resolvedData = data;
  });
  await flushTimeoutsAndPromises();
  mockSocket.eventFunctions.data("copy afile adir\n\r");
  await flushTimeoutsAndPromises();

  mockSocket.eventFunctions.data("some data\n\r");
  mockSocket.eventFunctions.data("some more data\n\r");
  mockSocket.eventFunctions.data("even more data\n\r");
  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();

  expect(resolvedData[0]).toEqual("some data");
  expect(resolvedData[1]).toEqual("some more data");
  expect(resolvedData[2]).toEqual("even more data");
});

it("returns a data event to the command callback then data is received before the command completes", async () => {
  let commandEvent: SocketCommandCallBackEvent | undefined = undefined;
  const commandCallback = (event: SocketCommandCallBackEvent | undefined) => {
    commandEvent = event;
  };
  const communicator = new SocketCommunicator();
  communicator.connect();
  mockSocket.eventFunctions.data("2.A Prompt>");
  await flushTimeoutsAndPromises();

  communicator.runCommand(
    "copy afile adir",
    commandCallback as SocketCommandCallback,
  );
  await flushTimeoutsAndPromises();
  mockSocket.eventFunctions.data("copy afile adir\n\r");
  await flushTimeoutsAndPromises();

  mockSocket.eventFunctions.data("some data\n\r");
  await flushTimeoutsAndPromises();

  expect(commandEvent!.message).toEqual("DATA_EVENT");
  expect(commandEvent!.data).toEqual("some data");
});
