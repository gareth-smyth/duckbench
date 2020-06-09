const InstallerLG = require('../../../src/plugins/InstallerLG');

it('calls the communicator to install installerLG once in each location requested', async () => {
    const communicator = {copy: jest.fn()};
    communicator.copy.mockResolvedValue('');

    const installerLG = new InstallerLG();
    await installerLG.install({optionValues: {location: 'A:'}}, communicator);
    await installerLG.install({optionValues: {location: 'A:'}}, communicator);
    await installerLG.install({optionValues: {location: 'B:'}}, communicator);

    expect(communicator.copy).toHaveBeenCalledTimes(2);
    expect(communicator.copy).toHaveBeenCalledWith('DB_TOOLS:Installer68k', 'A:');
    expect(communicator.copy).toHaveBeenCalledWith('DB_TOOLS:Installer68k', 'B:');
});

it('throws an error when copying throws', async () => {
    const communicator = {copy: jest.fn()};
    communicator.copy.mockImplementation(() => {
        throw new Error('copy error');
    });

    const installerLG = new InstallerLG();
    await expect(installerLG.install({optionValues: {location: 'A:'}}, communicator)).rejects.toThrow('copy error');
});
