const InstallerLG = require('../../src/plugins/InstallerLG');

it('calls the communicator to install installerLG once in each location requested', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockResolvedValue('');

    const installerLG = new InstallerLG();
    await installerLG.install({optionValues: {location: 'A:'}}, communicator);
    await installerLG.install({optionValues: {location: 'A:'}}, communicator);
    await installerLG.install({optionValues: {location: 'B:'}}, communicator);

    expect(communicator.sendCommand).toHaveBeenCalledTimes(2);
    expect(communicator.sendCommand).toHaveBeenCalledWith('copy DB_TOOLS:Installer68k A:');
    expect(communicator.sendCommand).toHaveBeenCalledWith('copy DB_TOOLS:Installer68k B:');
});

it('throws an error when send command returns anything other than an empty response', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockResolvedValue('Some value');

    const installerLG = new InstallerLG();
    await expect(installerLG.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});

it('throws an error when send command rejects', async () => {
    const communicator = {sendCommand: jest.fn()};
    communicator.sendCommand.mockRejectedValue('Some value');

    const installerLG = new InstallerLG();
    await expect(installerLG.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow();
});
