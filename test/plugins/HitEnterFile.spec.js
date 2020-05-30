const HitEnterFile = require('../../src/plugins/HitEnterFile');

it('returns the file location', () => {
    const hitEnterFile = new HitEnterFile();
    expect(hitEnterFile.getFile()).toEqual('ram:HitEnterFile.txt');
});

it('calls the communicator to write the file to ram:', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockResolvedValue('');

    const hitEnterFile = new HitEnterFile();
    await hitEnterFile.install({}, communicator);
    await hitEnterFile.install({}, communicator);

    expect(communicator.sendCommand).toHaveBeenCalledTimes(1);
    expect(communicator.sendCommand).toHaveBeenCalledWith('echo "\\n" > ram:HitEnterFile.txt');
});

it('throws an error when any non-empty response is received from send command', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockResolvedValue('something happened');

    const hitEnterFile = new HitEnterFile();
    await expect(hitEnterFile.install({}, communicator)).rejects.toThrow();
});

it('throws an error when any send command rejects', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockRejectedValue('something happened');

    const hitEnterFile = new HitEnterFile();
    await expect(hitEnterFile.install({}, communicator)).rejects.toThrow();
});
