const fs = require('fs');
const InstallWorkbench300 = require('../../../src/plugins/InstallWorkbench300');

const Communicator = require('../../../src/builder/Communicator');
const PluginStore = require('../../../src/builder/PluginStore');
const InstallLG = require('../../../src/plugins/InstallerLG');
const Patch = require('../../../src/plugins/Patch');
const UnADF = require('../../../src/plugins/UnADF');

jest.mock('fs');
jest.mock('../../../src/builder/Communicator');
jest.mock('../../../src/builder/PluginStore');
jest.mock('../../../src/plugins/InstallerLG');
jest.mock('../../../src/plugins/Patch');
jest.mock('../../../src/plugins/UnADF');

let communicator;
let pluginStore;
let installerLG;
let patch;
let unADF;

beforeEach(() => {
    communicator = new Communicator();
    pluginStore = new PluginStore();
    installerLG = new InstallLG();
    patch = new Patch();
    unADF = new UnADF();
    pluginStore.getPlugin.mockReturnValueOnce(patch).mockReturnValueOnce(unADF).mockReturnValueOnce(installerLG);

    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

const defaultOptions = {optionValues: {device: 'AA1'}};

describe('when the cache does not exist', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(false);
    });

    it('deletes and recreates the wb install cache', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete)
            .toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench300', {'ALL': true}, undefined, /.*/);
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench300');
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench300/wb');
    });

    it('calls unADF for each workbench disk', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

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
        await expect(installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('unadf error');

        expect(unADF.run).toHaveBeenCalledTimes(2);
        expect(communicator.assign).toHaveBeenCalledTimes(0);
        expect(patch.run).toHaveBeenCalledTimes(0);
        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls the communicator to assign the install disk', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

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
        await expect(installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('assign error');

        expect(unADF.run).toHaveBeenCalledTimes(6);
        expect(communicator.assign).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledTimes(0);
        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls patch for the install file', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledWith('Install3.0:Install/Install', 'DB_EXECUTION:wb3.0_install.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patch fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch error');
        });

        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('patch error');

        expect(unADF.run).toHaveBeenCalledTimes(6);
        expect(communicator.assign).toHaveBeenCalledTimes(6);
        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls installerLG to install workbench', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

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
        await expect(installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true}))
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
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

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
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(Logger.trace).toHaveBeenCalledWith(JSON.stringify(event));
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(2);
        expect(patch.run).toHaveBeenCalledWith('AA1:s/startup-sequence', 'DB_EXECUTION:wb3.0_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockResolvedValueOnce({}).mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(unADF.run).toHaveBeenCalledTimes(6);
        expect(communicator.assign).toHaveBeenCalledTimes(6);
        expect(patch.run).toHaveBeenCalledTimes(2);
        expect(installerLG.run).toHaveBeenCalledTimes(1);
    });
});

describe('when the cache is already populated', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(true);
    });

    it('does not delete and recreate the wb install cache', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete).toHaveBeenCalledTimes(0);
        expect(communicator.makedir).toHaveBeenCalledTimes(0);
    });

    it('does not call unADF for each workbench disk', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(unADF.run).toHaveBeenCalledTimes(0);
    });

    it('does not call the communicator to assign the install disk', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.assign).toHaveBeenCalledTimes(0);
    });

    it('does not call patch for the install file', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(patch.run).toHaveBeenCalledTimes(0);
    });

    it('does not call installerLG to install workbench', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledWith('AA1:s/startup-sequence', 'DB_EXECUTION:wb3.0_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install(defaultOptions, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(patch.run).toHaveBeenCalledTimes(1);
    });
});
