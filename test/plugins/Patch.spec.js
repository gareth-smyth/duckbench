const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const Patch = require('../../src/plugins/Patch');

jest.mock('fs');
jest.mock('request');

beforeEach(() => {
    fs.existsSync.mockReset();
    fs.writeFileSync.mockReset();
    request.mockReset();
});

it('returns Lha as a dependency', () => {
    const patch = new Patch();
    const config = patch.configure();

    expect(config).toEqual([{name: 'Lha', optionValues: {location: 'duckbench:c/'}}]);
});

it('calls the communicator to install patch once in each location requested, and unpacks once', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand
        .mockResolvedValueOnce(['something something', 'Operation successful.'])
        .mockResolvedValueOnce('')
        .mockResolvedValueOnce('');

    const patch = new Patch();
    await patch.install({optionValues: {location: 'A:'}}, communicator);
    await patch.install({optionValues: {location: 'A:'}}, communicator);
    await patch.install({optionValues: {location: 'B:'}}, communicator);

    expect(communicator.sendCommand).toHaveBeenCalledTimes(3);
    expect(communicator.sendCommand).toHaveBeenCalledWith('lha_68k x DB_TOOLS:Patch-2.1.lha duckbench:');
    expect(communicator.sendCommand).toHaveBeenCalledWith('copy duckbench:patch-2.1/c/patch A:');
    expect(communicator.sendCommand).toHaveBeenCalledWith('copy duckbench:patch-2.1/c/patch B:');
});

it('throws an error when extraction rejects', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockRejectedValue('error');

    const patch = new Patch();
    await expect(patch.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});

it('throws an error when extraction returns an unexpected response', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockResolvedValue(['some value']);

    const patch = new Patch();
    await expect(patch.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});

it('throws an error when copying file rejects', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand
        .mockResolvedValueOnce(['something something', 'Operation successful.'])
        .mockRejectedValueOnce('error');

    const patch = new Patch();
    await expect(patch.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});

it('throws an error when copying file returns an unexpected response', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand
        .mockResolvedValueOnce(['something something', 'Operation successful.'])
        .mockResolvedValueOnce(['some value']);

    const patch = new Patch();
    await expect(patch.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});

it('does not download the patch file when it already exists', async () => {
    fs.existsSync.mockReturnValueOnce(true);

    const patch = new Patch();
    await patch.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(0);
});

it('downloads the patch file when it does not exist', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockResolvedValueOnce({body: 'myfile'});

    const patch = new Patch();
    await patch.prepare();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(path.join(global.TOOLS_DIR, 'patch-2.1.lha'), 'myfile');
    expect(request).toHaveBeenCalledTimes(1);
    const expectedUri = 'http://aminet.net/dev/misc/patch-2.1.lha';
    expect(request).toHaveBeenCalledWith({encoding: null, resolveWithFullResponse: true, uri: expectedUri});
});

it('throws an error when downloading fails', async () => {
    fs.existsSync.mockReturnValueOnce(false);
    request.mockRejectedValue('error');

    const patch = new Patch();
    await expect(patch.prepare()).rejects.toThrow();
});
