const WinUAETools = require('../../../src/plugins/WinUAETools');

const communicator = {run: jest.fn()};

it('runs the winUAETools command', async ()=> {
    const pluginStore = {getPlugin: () => ({createInput: () => 'ram:somefile.txt'})};
    const winUAETools = new WinUAETools();
    await winUAETools.ejectFloppy('some_place:', 1, communicator, pluginStore);

    expect(communicator.run).toHaveBeenCalledWith('some_place:uaectrl', {'REDIRECT_IN': 'ram:somefile.txt'},
        undefined, '10) Exit UAE-Control');
});

it('throws an error when the installerLG command throws an error', async () => {
    const pluginStore = {getPlugin: () => ({createInput: () => 'ram:somefile.txt'})};
    const winUAETools = new WinUAETools();
    communicator.run.mockImplementation(() => {
        throw new Error('winUAETools error');
    });

    await expect(winUAETools.ejectFloppy('some_place:', 1, communicator, pluginStore))
        .rejects.toThrowError('winUAETools error');
});
