const Communicator = require('../../src/builder/Communicator');

let communicator;
let socketCommunicator;
let commandRunner;
beforeEach(() => {
    commandRunner = {run: jest.fn()};
    socketCommunicator = {close: jest.fn(), connect: jest.fn()};
    communicator = new Communicator(undefined, socketCommunicator, commandRunner);
});

const options = 'options';
const callback = () => 'aCallback';

it('runs the command runner', async () => {
    await communicator.run('some command', options, callback, 'response');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('some command', options, callback, 'response');
});

it('runs the assign command', async () => {
    await communicator.assign('name:', 'some:folder', options, callback, 'expected response');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('assign name: some:folder', options, callback, 'expected response');
});

it('runs the assign command with defaults', async () => {
    await communicator.assign('name:', 'some:folder');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('assign name: some:folder', {}, expect.any(Function), undefined);
});

it('runs the cd command', async () => {
    await communicator.cd('some:folder', options, callback);
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('cd some:folder', options, callback);
});

it('runs the cd command with defaults', async () => {
    await communicator.cd('some:folder');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('cd some:folder', {}, expect.any(Function));
});

it('runs the copy command', async () => {
    await communicator.copy('filename', 'some:folder', options, callback, 'expect response');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('copy filename some:folder', options, callback, 'expect response');
});

it('runs the copy command with defaults', async () => {
    await communicator.copy('filename', 'some:folder');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('copy filename some:folder', {}, expect.any(Function), undefined);
});

it('runs the delete command', async () => {
    await communicator.delete('some:file', options, callback);
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run)
        .toBeCalledWith('delete some:file', options, callback, 'some:file  Deleted');
});

it('runs the delete command with defaults', async () => {
    await communicator.delete('some:file');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run)
        .toBeCalledWith('delete some:file', {}, expect.any(Function), 'some:file  Deleted');
});

it('runs the echo command', async () => {
    await communicator.echo('something', options, callback);
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('echo "something"', options, callback);
});

it('runs the echo command with defaults', async () => {
    await communicator.echo('something');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('echo "something"', {}, expect.any(Function));
});

it('runs the format command', async () => {
    await communicator.format('drive', 'volume', options, callback);
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run)
        .toBeCalledWith('format drive drive name volume', options, callback, 'Initializing disk...');
});

it('runs the format command with defaults', async () => {
    await communicator.format('drive', 'volume');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run)
        .toBeCalledWith('format drive drive name volume', {}, expect.any(Function), 'Initializing disk...');
});

it('runs the makedir command', async () => {
    await communicator.makedir('DB0:folder', options, callback);
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('makedir DB0:folder', options, callback);
});

it('runs the makedir command with defaults', async () => {
    await communicator.makedir('DB0:folder');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('makedir DB0:folder', {}, expect.any(Function));
});

it('runs the path command', async () => {
    await communicator.path('DB0:folder', options, callback);
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('path DB0:folder', options, callback);
});

it('runs the path command with defaults', async () => {
    await communicator.path('DB0:folder');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('path DB0:folder', {}, expect.any(Function));
});

it('runs the protect command', async () => {
    await communicator.protect('DB0:folder', options, callback);
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('protect DB0:folder', options, callback);
});

it('runs the protect command with defaults', async () => {
    await communicator.protect('DB0:folder');
    expect(commandRunner.run).toHaveBeenCalledTimes(1);
    expect(commandRunner.run).toBeCalledWith('protect DB0:folder', {}, expect.any(Function));
});

it('closes the socket communicator', async () => {
    await communicator.close();
    expect(socketCommunicator.close).toHaveBeenCalledTimes(1);
});

it('connects to the socket communicator', async () => {
    await communicator.connect();
    expect(socketCommunicator.connect).toHaveBeenCalledTimes(1);
});
