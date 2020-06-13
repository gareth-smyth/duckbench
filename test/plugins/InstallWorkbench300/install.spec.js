const InstallWorkbench300 = require('../../../src/plugins/InstallWorkbench300');

beforeEach(() => {
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

const pluginStore = { };
const unADF = {run: jest.fn()};
const patch = {run: jest.fn()};
const installerLG = {run: jest.fn()};
const communicator = {assign: jest.fn()};

beforeEach(() => {
    pluginStore.getPlugin = jest.fn();
    pluginStore.getPlugin
        .mockReturnValueOnce(unADF)
        .mockReturnValueOnce(patch)
        .mockReturnValueOnce(installerLG);
});

it('calls unADF for each workbench disk', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true});

    expect(unADF.run).toHaveBeenCalledTimes(6);
    expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-install.adf',
        'duckbench:disks/', 'duckbench:', {}, communicator);
    expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-workbench.adf',
        'duckbench:disks/', 'duckbench:', {}, communicator);
    expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-locale.adf',
        'duckbench:disks/', 'duckbench:', {}, communicator);
    expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-fonts.adf',
        'duckbench:disks/', 'duckbench:', {}, communicator);
    expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-extras.adf',
        'duckbench:disks/', 'duckbench:', {}, communicator);
    expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-storage.adf',
        'duckbench:disks/', 'duckbench:', {}, communicator);
});

it('throws an error if it cannot unADF a disk', async () => {
    unADF.run.mockResolvedValueOnce({}).mockImplementation(() => {
        throw new Error('unadf error');
    });

    const installWorkbench300 = new InstallWorkbench300();
    await expect(installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true}))
        .rejects.toThrowError('unadf error');

    expect(unADF.run).toHaveBeenCalledTimes(2);
    expect(communicator.assign).toHaveBeenCalledTimes(0);
    expect(patch.run).toHaveBeenCalledTimes(0);
    expect(installerLG.run).toHaveBeenCalledTimes(0);
});

it('calls the communicator to assign the install disk', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true});

    expect(communicator.assign).toHaveBeenCalledTimes(6);
    expect(communicator.assign).toHaveBeenCalledWith('Install3.0:', 'duckbench:disks/Install3.0');
    expect(communicator.assign).toHaveBeenCalledWith('Workbench3.0:', 'duckbench:disks/Workbench3.0');
    expect(communicator.assign).toHaveBeenCalledWith('Locale:', 'duckbench:disks/Locale');
    expect(communicator.assign).toHaveBeenCalledWith('Fonts:', 'duckbench:disks/Fonts');
    expect(communicator.assign).toHaveBeenCalledWith('Extras3.0:', 'duckbench:disks/Extras3.0');
    expect(communicator.assign).toHaveBeenCalledWith('Storage3.0:', 'duckbench:disks/Storage3.0');
});

it('throws an error if assign fails', async () => {
    communicator.assign.mockImplementation(() => {
        throw new Error('assign error');
    });
    const installWorkbench300 = new InstallWorkbench300();
    await expect(installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true}))
        .rejects.toThrowError('assign error');

    expect(unADF.run).toHaveBeenCalledTimes(6);
    expect(communicator.assign).toHaveBeenCalledTimes(1);
    expect(patch.run).toHaveBeenCalledTimes(0);
    expect(installerLG.run).toHaveBeenCalledTimes(0);
});

it('calls patch for the install file', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true});

    expect(patch.run).toHaveBeenCalledTimes(1);
    expect(patch.run).toHaveBeenCalledWith('Install3.0:Install/Install', 'DB_EXECUTION:wb3.0_install.patch',
        'duckbench:c/', {}, communicator);
});

it('throws an error if patch fails', async () => {
    patch.run.mockImplementation(() => {
        throw new Error('patch error');
    });

    const installWorkbench300 = new InstallWorkbench300();
    await expect(installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true}))
        .rejects.toThrowError('patch error');

    expect(unADF.run).toHaveBeenCalledTimes(6);
    expect(communicator.assign).toHaveBeenCalledTimes(6);
    expect(patch.run).toHaveBeenCalledTimes(1);
    expect(installerLG.run).toHaveBeenCalledTimes(0);
});

it('calls patch for the startup sequence if there is no floppy', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: false});

    expect(patch.run).toHaveBeenCalledTimes(2);
    expect(patch.run).toHaveBeenCalledWith('DH0:s/startup-sequence', 'DB_EXECUTION:wb3.0_no_floppy_startup.patch',
        'duckbench:c/', {}, communicator);
});

it('throws an error if patching startup sequence fails', async () => {
    patch.run.mockResolvedValueOnce({}).mockImplementation(() => {
        throw new Error('patch startup error');
    });

    const installWorkbench300 = new InstallWorkbench300();
    await expect(installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: false}))
        .rejects.toThrowError('patch startup error');

    expect(unADF.run).toHaveBeenCalledTimes(6);
    expect(communicator.assign).toHaveBeenCalledTimes(6);
    expect(patch.run).toHaveBeenCalledTimes(2);
    expect(installerLG.run).toHaveBeenCalledTimes(1);
});

it('calls installerLG to install workbench', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true});

    expect(installerLG.run).toHaveBeenCalledTimes(1);
    expect(installerLG.run).toHaveBeenCalledWith('Install3.0:install/install',
        {'REDIRECT_IN': 'DB_EXECUTION:install_key'},
        communicator, expect.any(Function), 'The installation of Release 3 is now complete.');
});

it('throws an error if installerLG fails', async () => {
    installerLG.run.mockImplementation(() => {
        throw new Error('installerLG error');
    });

    const installWorkbench300 = new InstallWorkbench300();
    await expect(installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true}))
        .rejects.toThrowError('installerLG error');

    expect(unADF.run).toHaveBeenCalledTimes(6);
    expect(communicator.assign).toHaveBeenCalledTimes(6);
    expect(patch.run).toHaveBeenCalledTimes(1);
    expect(installerLG.run).toHaveBeenCalledTimes(1);
});

it('logs progress messages', async () => {
    installerLG.run.mockImplementation((command, options, communicator, callback) => {
        if (callback) {
            callback({message: 'DATA_EVENT', data: 'Progress: 10%'});
        }
        return Promise.resolve(['The installation of Release 3.1 is now complete.']);
    });

    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true});

    expect(Logger.info).toHaveBeenCalledWith('10%');
});

it('logs non-progress messages', async () => {
    const event = {message: 'DATA_EVENT', data: 'NotProgress: 10%'};
    installerLG.run.mockImplementation((command, options, communicator, callback) => {
        if (callback) {
            callback(event);
        }
        return Promise.resolve(['The installation of Release 3.1 is now complete.']);
    });

    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.install({}, communicator, pluginStore, {floppyDrive: true});

    expect(Logger.trace).toHaveBeenCalledWith(JSON.stringify(event));
});
