const CommandRunner = require('../../src/builder/CommandRunner');

let socketCommunicator;
let commandRunner;
const callback = () => {};

beforeEach(() => {
    socketCommunicator = {runCommand: jest.fn()};
    commandRunner = new CommandRunner(socketCommunicator);
});

it('throws an error when the socket communicator throws an error', async () => {
    socketCommunicator.runCommand.mockRejectedValue('run command error');

    await expect(commandRunner.run('aCommand', {}, callback)).rejects.toThrowError('run command error');
});

it('runs the command without options when none are supplied', async () => {
    socketCommunicator.runCommand.mockResolvedValue([]);

    await commandRunner.run('aCommand', {}, callback);

    expect(socketCommunicator.runCommand).toHaveBeenCalledTimes(1);
    expect(socketCommunicator.runCommand).toHaveBeenCalledWith('aCommand', callback);
});

it('runs the command with options when supplied', async () => {
    socketCommunicator.runCommand.mockResolvedValue([]);

    await commandRunner.run('aCommand', {
        'REDIRECT_IN': 'input',
        'REDIRECT_OUT': 'output',
        'option1': true,
        'option2': 'optionValue',
    }, callback);

    expect(socketCommunicator.runCommand).toHaveBeenCalledTimes(1);
    expect(socketCommunicator.runCommand)
        .toHaveBeenCalledWith('aCommand option1 option2 optionValue < input > output', callback);
});

it('resolves when the expected response contains expected string', async () => {
    socketCommunicator.runCommand.mockResolvedValue(['a response', 'some other a response']);

    await commandRunner.run('aCommand', {}, callback, 'some other');

    expect(socketCommunicator.runCommand).toHaveBeenCalledTimes(1);
    expect(socketCommunicator.runCommand).toHaveBeenCalledWith('aCommand', callback);
});

it('rejects when the expected response does not contain expected string', async () => {
    socketCommunicator.runCommand.mockResolvedValue(['a response', 'some other a response']);

    const expectedError = 'Expected "some third response" from "aCommand" but got "a response,some other a response"';
    await expect(commandRunner.run('aCommand', {}, callback, 'some third response'))
        .rejects.toThrowError(expectedError);
});

it('resolves when the expected response matches expected regex', async () => {
    socketCommunicator.runCommand.mockResolvedValue(['a response', 'some other a response']);

    await commandRunner.run('aCommand', {}, callback, /some .* response/);

    expect(socketCommunicator.runCommand).toHaveBeenCalledTimes(1);
    expect(socketCommunicator.runCommand).toHaveBeenCalledWith('aCommand', callback);
});

it('rejects when the expected response does not match expected regex', async () => {
    socketCommunicator.runCommand.mockResolvedValue(['a response', 'some other a response']);

    const regExpExpected = /some third .* response/;
    const expectedError = `Expected "${regExpExpected}" from "aCommand" but got "a response,some other a response"`;
    await expect(commandRunner.run('aCommand', {}, callback, regExpExpected))
        .rejects.toThrowError(expectedError);
});

it('resolves when the expected response matches all expectations', async () => {
    socketCommunicator.runCommand.mockResolvedValue(['a response', 'some other a response']);

    await commandRunner.run('aCommand', {}, callback, /some .* response/);

    expect(socketCommunicator.runCommand).toHaveBeenCalledTimes(1);
    expect(socketCommunicator.runCommand).toHaveBeenCalledWith('aCommand', callback);
});

it('rejects when the expected response does not match all expectations', async () => {
    socketCommunicator.runCommand.mockResolvedValue(['a response', 'some other a response']);

    const regExpExpected = /some third .* response/;
    const expectedError = `Expected "${regExpExpected},some other" from "aCommand" ` +
        'but got "a response,some other a response"';
    await expect(commandRunner.run('aCommand', {}, callback, [regExpExpected, 'some other']))
        .rejects.toThrowError(expectedError);
});

it('rejects when the expected response does not match expectation of no response', async () => {
    socketCommunicator.runCommand.mockResolvedValue(['a response', 'some other a response']);

    const expectedError = 'Expected no response from "aCommand" but got "a response,some other a response"';
    await expect(commandRunner.run('aCommand', {}, callback, undefined)).rejects.toThrowError(expectedError);
});
