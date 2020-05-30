const net = require('net');

const Communicator = require('../../src/builder/Communicator');

jest.mock('net');
jest.useFakeTimers();

// As some functionality resolves promises with setTimeout we need to fake time passing and promise resolution cycle
async function flushTimeoutsAndPromises() {
    jest.runAllTimers();
    await Promise.resolve();
}

let mockSocket;
beforeEach(() => {
    mockSocket = {
        eventFunctions: [],
        destroy: jest.fn(),
        on: jest.fn().mockImplementation((event, func) => {
            mockSocket.eventFunctions[event] = func;
        }),
        connect: jest.fn(),
        write: jest.fn(),
    };
    net.Socket.mockImplementation(() => mockSocket);
});

it('attaches methods to the client event emitter', () => {
    new Communicator();
    expect(mockSocket.on).toHaveBeenCalledTimes(4);
    expect(mockSocket.on).toHaveBeenCalledWith('data', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('close', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('ready', expect.any(Function));
});

it('destroys the client when close is called', () => {
    const communicator = new Communicator();
    communicator.close();
    expect(mockSocket.destroy).toHaveBeenCalledTimes(1);
});

it('resolves connection when a prompt is sent over the socket', async () => {
    const communicator = new Communicator();
    const connectionPromise = communicator.connect();

    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();
    expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    expect(mockSocket.connect).toHaveBeenCalledWith(1234, '127.0.0.1');

    return connectionPromise;
});

it('resolves connection when a prompt is sent over the socket in two "packets"', async () => {
    const communicator = new Communicator();
    const connectionPromise = communicator.connect();

    mockSocket.eventFunctions.data('2.A Pr');
    mockSocket.eventFunctions.data('ompt>');
    await flushTimeoutsAndPromises();
    expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    expect(mockSocket.connect).toHaveBeenCalledWith(1234, '127.0.0.1');

    return connectionPromise;
});

it('does not resolve the connection until a prompt is received', async () => {
    const communicator = new Communicator();
    let connectionResolved = false;
    communicator.connect().then(() => {
        connectionResolved = true;
    });

    // missing the the last ">" so doesn't count as a prompt
    mockSocket.eventFunctions.data('2. Not quite a prompt\n\r');
    await flushTimeoutsAndPromises();
    expect(connectionResolved).toEqual(false);

    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();
    expect(connectionResolved).toEqual(true);
});

it('calls the control callback when a close event is received', async () => {
    let closeEvent = {};
    const controlCallback = (event) => {
        closeEvent = event;
    };
    new Communicator(controlCallback);

    mockSocket.eventFunctions.close();
    await flushTimeoutsAndPromises();
    expect(closeEvent.message).toEqual('CLOSE_EVENT');
});

it('calls the control callback when a connect event is received', async () => {
    let connectEvent = {};
    const controlCallback = (event) => {
        connectEvent = event;
    };
    new Communicator(controlCallback);

    mockSocket.eventFunctions.connect();
    await flushTimeoutsAndPromises();
    expect(connectEvent.message).toEqual('CONNECT_EVENT');
});

it('calls the control callback when a ready event is received', async () => {
    let readyEvent = {};
    const controlCallback = (event) => {
        readyEvent = event;
    };
    new Communicator(controlCallback);

    mockSocket.eventFunctions.ready();
    await flushTimeoutsAndPromises();
    expect(readyEvent.message).toEqual('READY_EVENT');
});

it('calls the control callback when output is received without sending a command', async () => {
    let dataEvent = {};
    const controlCallback = (event) => {
        dataEvent = event;
    };
    const communicator = new Communicator(controlCallback);
    communicator.connect();

    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();

    mockSocket.eventFunctions.data('This is the sent line\n\r');
    await flushTimeoutsAndPromises();
    expect(dataEvent.message).toEqual('DATA_EVENT');
    expect(dataEvent.data).toEqual('This is the sent line');
});

it('calls the control callback when a command has been sent but not yet received the echo', async () => {
    let dataEvent = {};
    const controlCallback = (event) => {
        dataEvent = event;
    };
    const communicator = new Communicator(controlCallback);
    communicator.connect();
    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();

    communicator.sendCommand('copy afile adir');
    await flushTimeoutsAndPromises();

    mockSocket.eventFunctions.data('This is the sent line\n\r');
    await flushTimeoutsAndPromises();
    expect(dataEvent.message).toEqual('DATA_EVENT');
    expect(dataEvent.data).toEqual('This is the sent line');
});

it('calls the control callback when a command has been sent but not yet received the echo', async () => {
    let dataEvent = {};
    const controlCallback = (event) => {
        dataEvent = event;
    };
    const communicator = new Communicator(controlCallback);
    communicator.connect();
    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();

    communicator.sendCommand('copy afile adir');
    await flushTimeoutsAndPromises();

    mockSocket.eventFunctions.data('This is the sent line\n\r');
    await flushTimeoutsAndPromises();
    expect(dataEvent.message).toEqual('DATA_EVENT');
    expect(dataEvent.data).toEqual('This is the sent line');
});

it('calls the command callback when a command has been sent and echoed but not completed', async () => {
    let commandEvent = {};
    const commandCallback = (event) => {
        commandEvent = event;
    };
    const communicator = new Communicator();
    communicator.connect();
    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();

    communicator.sendCommand('copy afile adir', commandCallback);
    await flushTimeoutsAndPromises();

    mockSocket.eventFunctions.data('copy afile adir\n\r');
    await flushTimeoutsAndPromises();
    expect(commandEvent.message).toEqual('COMMAND_RECEIVED');
    expect(commandEvent.data).toEqual('copy afile adir');
});

it('resolves the command promise with sent data when a new prompt is received', async () => {
    let resolvedData = {};
    const communicator = new Communicator();
    communicator.connect();
    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();

    communicator.sendCommand('copy afile adir').then((data) => {
        resolvedData = data;
    });
    await flushTimeoutsAndPromises();
    mockSocket.eventFunctions.data('copy afile adir\n\r');
    await flushTimeoutsAndPromises();

    mockSocket.eventFunctions.data('some data\n\r');
    mockSocket.eventFunctions.data('some more data\n\r');
    mockSocket.eventFunctions.data('even more data\n\r');
    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();

    expect(resolvedData[0]).toEqual('some data');
    expect(resolvedData[1]).toEqual('some more data');
    expect(resolvedData[2]).toEqual('even more data');
});

it('returns a data event to the command callback then data is received before the command completes', async () => {
    let commandEvent = {};
    const commandCallback = (event) => {
        commandEvent = event;
    };
    const communicator = new Communicator();
    communicator.connect();
    mockSocket.eventFunctions.data('2.A Prompt>');
    await flushTimeoutsAndPromises();

    communicator.sendCommand('copy afile adir', commandCallback);
    await flushTimeoutsAndPromises();
    mockSocket.eventFunctions.data('copy afile adir\n\r');
    await flushTimeoutsAndPromises();

    mockSocket.eventFunctions.data('some data\n\r');
    await flushTimeoutsAndPromises();

    expect(commandEvent.message).toEqual('DATA_EVENT');
    expect(commandEvent.data).toEqual('some data');
});
