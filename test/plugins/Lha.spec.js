const fs = require('fs');
const request = require('request-promise');

const Lha = require('../../src/plugins/Lha');

jest.mock('fs');
jest.mock('request');

beforeEach(() => {
    fs.existsSync.mockReset();
    fs.writeFileSync.mockReset();
    request.mockReset();
});

it('calls the communicator to install lha once in each location requested', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockResolvedValue(['something something', 'Extracting: lha_68k']);

    const lha = new Lha();
    await lha.install({optionValues: {location: 'A:'}}, communicator);
    await lha.install({optionValues: {location: 'A:'}}, communicator);
    await lha.install({optionValues: {location: 'B:'}}, communicator);

    expect(communicator.sendCommand).toHaveBeenCalledTimes(2);
    expect(communicator.sendCommand).toHaveBeenCalledWith('DB_TOOLS:lha.run -x A:');
    expect(communicator.sendCommand).toHaveBeenCalledWith('DB_TOOLS:lha.run -x B:');
});

it('throws an error when send command rejects', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockRejectedValue('error');

    const lha = new Lha();

    await expect(lha.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});

it('throws an error when send command response does not include extraction of lha_68k', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockResolvedValue(['something something', 'dark side']);

    const lha = new Lha();

    await expect(lha.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});

it('does not download the lha.run file when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    const lha = new Lha();
    await lha.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it('downloads the lha.run file when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockResolvedValue({body: 'myfile'});

    const lha = new Lha();
    await lha.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith('./external_tools/lha.run', 'myfile');
    expect(request).toHaveBeenCalledTimes(1);
    const expectedUri = 'http://aminet.net/util/arc/lha.run';
    expect(request).toHaveBeenCalledWith({encoding: null, resolveWithFullResponse: true, uri: expectedUri});
});

it('throws an error when downloading fails', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockRejectedValue('an_error');

    const lha = new Lha();

    await expect(lha.prepare()).rejects.toThrow();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});
