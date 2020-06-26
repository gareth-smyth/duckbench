const fs = require('fs-extra');
const InstallWorkbench390 = require('../../../src/plugins/InstallWorkbench390');

const Communicator = require('../../../src/builder/Communicator');
const PluginStore = require('../../../src/builder/PluginStore');
const InstallLG = require('../../../src/plugins/InstallerLG');
const Patch = require('../../../src/plugins/Patch');

jest.mock('fs-extra');
jest.mock('../../../src/builder/Communicator');
jest.mock('../../../src/builder/PluginStore');
jest.mock('../../../src/plugins/InstallerLG');
jest.mock('../../../src/plugins/Patch');

let communicator;
let pluginStore;
let installerLG;
let patch;

beforeEach(() => {
    communicator = new Communicator();
    pluginStore = new PluginStore();
    installerLG = new InstallLG();
    patch = new Patch();
    pluginStore.getPlugin.mockReturnValueOnce(patch).mockReturnValueOnce(installerLG);

    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

const defaultOptions = {optionValues: {device: 'AA1'}};

describe('when the cache does not exist', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(false);
    });

    it('deletes and recreates the wb install cache', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete)
            .toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390', {'ALL': true}, undefined, /.*/);
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390');
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/wb');
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/installcd');
    });

    it('calls copy to copy the host cached files to client cache and unprotects them', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.copy).toHaveBeenCalledTimes(2);
        expect(communicator.copy).toHaveBeenCalledWith('DB_HOST_CACHE:OS-Version3.9',
            'DB_CLIENT_CACHE:InstallWorkbench390/installcd',
            {'ALL': true, 'CLONE': true}, undefined, '..copied');
        expect(communicator.protect).toHaveBeenCalledTimes(1);
        expect(communicator.protect).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/installcd',
            {'+wd': true, 'all': true}, undefined, '..done');
    });

    it('throws an error if copying cached files fails', async () => {
        communicator.copy.mockImplementation(() => {
            throw new Error('copy error');
        });
        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('copy error');

        expect(installerLG.run).toHaveBeenCalledTimes(0);
        expect(communicator.copy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if unprotecting cached files fails', async () => {
        communicator.protect.mockImplementation(() => {
            throw new Error('protect error');
        });
        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('protect error');

        expect(installerLG.run).toHaveBeenCalledTimes(0);
        expect(communicator.copy).toHaveBeenCalledTimes(1);
    });

    it('calls installerLG to install workbench', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(installerLG.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/installcd/OS3.9Install-Emu',
            {'REDIRECT_IN': 'DB_EXECUTION:wb390_install_key'},
            communicator, expect.any(Function), 'The installation of Release 3.9 is now complete.');
    });

    it('throws an error if installerLG fails', async () => {
        installerLG.run.mockImplementation(() => {
            throw new Error('installerLG error');
        });

        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('installerLG error');

        expect(communicator.copy).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledTimes(1);
    });

    it('logs progress messages', async () => {
        installerLG.run.mockImplementation((command, options, communicator, callback) => {
            if (callback) {
                callback({message: 'DATA_EVENT', data: 'Progress: 10%'});
            }
            return Promise.resolve(['The installation of Release 3.9 is now complete.']);
        });

        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(Logger.info).toHaveBeenCalledWith('10%');
    });

    it('logs non-progress messages', async () => {
        const event = {message: 'DATA_EVENT', data: 'NotProgress: 10%'};
        installerLG.run.mockImplementation((command, options, communicator, callback) => {
            if (callback) {
                callback(event);
            }
            return Promise.resolve(['The installation of Release 3.9 is now complete.']);
        });

        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(Logger.trace).toHaveBeenCalledWith(JSON.stringify(event));
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledWith('AA1:s/startup-sequence', 'DB_EXECUTION:wb3.9_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledTimes(1);
    });
});

describe('when the cache is already populated', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(true);
    });

    it('does not delete and recreate the wb install cache', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete).toHaveBeenCalledTimes(0);
        expect(communicator.makedir).toHaveBeenCalledTimes(0);
    });

    it('does not call copy to copy the host cached files to client cache and unprotect them', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.copy).toHaveBeenCalledTimes(1);
        expect(communicator.copy).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/wb',
            'AA1:', {'ALL': true, 'CLONE': true}, undefined, 'copied');
        expect(communicator.protect).toHaveBeenCalledTimes(0);
    });

    it('does not call installerLG to install workbench', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: true});

        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledWith('AA1:s/startup-sequence', 'DB_EXECUTION:wb3.9_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(defaultOptions, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(patch.run).toHaveBeenCalledTimes(1);
    });
});
