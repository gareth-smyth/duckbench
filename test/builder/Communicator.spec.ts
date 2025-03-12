import Communicator from "../../src/builder/Communicator.js";
import SocketCommunicator from "../../src/builder/SocketCommunicator";
import CommandRunner from "../../src/builder/CommandRunner";
import { MockedObject, vi } from "vitest";
vi.mock("../../src/builder/SocketCommunicator");
vi.mock("../../src/builder/CommandRunner");

let communicator: Communicator;
let socketCommunicator: MockedObject<SocketCommunicator>;
let commandRunner: MockedObject<CommandRunner>;
beforeEach(() => {
  socketCommunicator = vi.mocked(new SocketCommunicator());
  commandRunner = vi.mocked(new CommandRunner(socketCommunicator));
  communicator = new Communicator(undefined, socketCommunicator, commandRunner);
});

const options = {};
const callback = () => "aCallback";

it("runs the command runner", async () => {
  await communicator.run("some command", options, callback, "response");
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "some command",
    options,
    callback,
    "response",
  );
});

it("runs the assign command", async () => {
  await communicator.assign(
    "name:",
    "some:folder",
    options,
    callback,
    "expected response",
  );
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "assign name: some:folder",
    options,
    callback,
    "expected response",
  );
});

it("runs the assign command with defaults", async () => {
  await communicator.assign("name:", "some:folder", options);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "assign name: some:folder",
    {},
    expect.any(Function),
    undefined,
  );
});

it("runs the cd command", async () => {
  await communicator.cd("some:folder", options, callback);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "cd some:folder",
    options,
    callback,
  );
});

it("runs the cd command with defaults", async () => {
  await communicator.cd("some:folder");
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "cd some:folder",
    {},
    expect.any(Function),
  );
});

it("runs the copy command", async () => {
  await communicator.copy(
    "filename",
    "some:folder",
    options,
    callback,
    "expect response",
  );
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "copy filename some:folder",
    options,
    callback,
    "expect response",
  );
});

it("runs the copy command with defaults", async () => {
  await communicator.copy("filename", "some:folder");
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "copy filename some:folder",
    {},
    expect.any(Function),
    undefined,
  );
});

it("runs the delete command", async () => {
  await communicator.delete("some:file", options, callback);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "delete some:file",
    options,
    callback,
    "some:file  Deleted",
  );
});

it("runs the delete command with defaults", async () => {
  await communicator.delete("some:file", options);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "delete some:file",
    {},
    expect.any(Function),
    "some:file  Deleted",
  );
});

it("runs the echo command", async () => {
  await communicator.echo("something", options, callback);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    'echo "something"',
    options,
    callback,
  );
});

it("runs the echo command with defaults", async () => {
  await communicator.echo("something", options);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    'echo "something"',
    {},
    expect.any(Function),
  );
});

it("runs the format command", async () => {
  await communicator.format("drive", "volume", options, callback);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "format drive drive name volume",
    options,
    callback,
    /^((?!Format Failure).)*$/,
  );
});

it("runs the format command with defaults", async () => {
  await communicator.format("drive", "volume");
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "format drive drive name volume",
    {},
    expect.any(Function),
    /^((?!Format Failure).)*$/,
  );
});

it("runs the makedir command", async () => {
  await communicator.makedir("DB0:folder", options, callback);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "makedir DB0:folder",
    options,
    callback,
  );
});

it("runs the makedir command with defaults", async () => {
  await communicator.makedir("DB0:folder");
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "makedir DB0:folder",
    {},
    expect.any(Function),
  );
});

it("runs the path command", async () => {
  await communicator.path("DB0:folder", options, callback);
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "path DB0:folder",
    options,
    callback,
  );
});

it("runs the path command with defaults", async () => {
  await communicator.path("DB0:folder");
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "path DB0:folder",
    {},
    expect.any(Function),
  );
});

it("runs the protect command", async () => {
  await communicator.protect(
    "DB0:folder",
    options,
    callback,
    "expect response",
  );
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "protect DB0:folder",
    options,
    callback,
    "expect response",
  );
});

it("runs the protect command with defaults", async () => {
  await communicator.protect("DB0:folder");
  expect(commandRunner.run).toHaveBeenCalledTimes(1);
  expect(commandRunner.run).toHaveBeenCalledWith(
    "protect DB0:folder",
    {},
    expect.any(Function),
    undefined,
  );
});

it("closes the socket communicator", async () => {
  await communicator.close();
  expect(socketCommunicator.close).toHaveBeenCalledTimes(1);
});

it("connects to the socket communicator", async () => {
  await communicator.connect();
  expect(socketCommunicator.connect).toHaveBeenCalledTimes(1);
});
