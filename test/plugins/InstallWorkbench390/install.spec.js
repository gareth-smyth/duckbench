const fs = require('fs-extra');
const InstallWorkbench390 = require('../../../src/plugins/InstallWorkbench390');

const Communicator = require('../../../src/builder/Communicator');
const PluginStore = require('../../../src/builder/PluginStore');
const InstallLG = require('../../../src/plugins/InstallerLG');
const Patch = require('../../../src/plugins/Patch');
const WinUAETools = require('../../../src/plugins/WinUAETools');
const UnADF = require('../../../src/plugins/UnADF');

jest.mock('fs-extra');
jest.mock('../../../src/builder/Communicator');
jest.mock('../../../src/builder/PluginStore');
jest.mock('../../../src/plugins/InstallerLG');
jest.mock('../../../src/plugins/Patch');
jest.mock('../../../src/plugins/WinUAETools');
jest.mock('../../../src/plugins/UnADF');

let communicator;
let pluginStore;
let installerLG;
let patch;
let unADF;
let winUAETools;

beforeEach(() => {
    communicator = new Communicator();
    pluginStore = new PluginStore();
    installerLG = new InstallLG();
    unADF = new UnADF();
    patch = new Patch();
    winUAETools = new WinUAETools();
    pluginStore.getPlugin.mockReturnValueOnce(patch)
        .mockReturnValueOnce(unADF)
        .mockReturnValueOnce(installerLG)
        .mockReturnValueOnce(winUAETools);

    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

const config = {optionValues: {customisePrefs: 'Yes'}};

describe('when the cache does not exist', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(false);
    });

    it('deletes and recreates the wb install cache', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete)
            .toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390', {'ALL': true}, undefined, /.*/);
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390');
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/wb');
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/installcd');
    });

    it('calls copy to copy the host cached files to client cache and unprotects them', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.copy).toHaveBeenCalledWith('CD0:OS-Version3.9',
            'DB_CLIENT_CACHE:InstallWorkbench390/installcd',
            {'ALL': true, 'CLONE': true}, undefined, '..copied');
        expect(communicator.protect).toHaveBeenCalledTimes(1);
        expect(communicator.protect).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/installcd',
            {'+wd': true, 'all': true}, undefined, '..done');
    });

    it('calls the communicator to discover if there is a work partition', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.assign).toHaveBeenCalledTimes(1);
        expect(communicator.assign).toHaveBeenCalledWith('', '', {}, expect.any(Function), 'Volumes:');
    });

    it('throws an error if copying cached files fails', async () => {
        communicator.copy.mockImplementation(() => {
            throw new Error('copy error');
        });
        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('copy error');

        expect(installerLG.run).toHaveBeenCalledTimes(0);
        expect(communicator.copy).toHaveBeenCalledTimes(1);
    });

    it('throws an error if unprotecting cached files fails', async () => {
        communicator.protect.mockImplementation(() => {
            throw new Error('protect error');
        });
        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('protect error');

        expect(installerLG.run).toHaveBeenCalledTimes(0);
        expect(communicator.copy).toHaveBeenCalledTimes(1);
    });

    it('calls installerLG to install workbench', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(installerLG.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/installcd/OS3.9Install-Emu',
            {'REDIRECT_IN': 'DB_EXECUTION:wb3.9_install_key'},
            communicator, expect.any(Function), 'The installation of Release 3.9 is now complete.');
    });

    it('throws an error if installerLG fails', async () => {
        installerLG.run.mockImplementation(() => {
            throw new Error('installerLG error');
        });

        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true}))
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
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

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
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(Logger.trace).toHaveBeenCalledWith(JSON.stringify(event));
    });

    it('calls patch for the install script', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(2);
        expect(patch.run).toHaveBeenCalledWith('DH0:s/startup-sequence', 'DB_EXECUTION:wb3.9_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching install script fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch install error');
        });

        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch install error');

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(2);
        expect(patch.run).toHaveBeenCalledWith('DH0:s/startup-sequence', 'DB_EXECUTION:wb3.9_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockResolvedValueOnce(config).mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(patch.run).toHaveBeenCalledTimes(2);
        expect(installerLG.run).toHaveBeenCalledTimes(1);
    });
});

describe('when the cache is already populated', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(true);
    });

    it('does not delete and recreate the wb install cache', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete).toHaveBeenCalledTimes(0);
        expect(communicator.makedir).toHaveBeenCalledTimes(1);
        expect(communicator.makedir).not.toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390');
        expect(communicator.makedir).not.toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/wb');
    });

    it('does not call copy to copy the host cached files to client cache and unprotect them', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.copy).toHaveBeenCalledTimes(5);
        expect(communicator.copy).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench390/wb',
            'DH0:', {'ALL': true, 'CLONE': true}, undefined, 'copied');
        expect(communicator.copy).toHaveBeenCalledWith('DB_EXECUTION:screenmode.prefs', 'dh0:prefs/Env-Archive/sys');
        expect(communicator.copy).not.toHaveBeenCalledWith('DB_HOST_CACHE:OS-Version3.9',
            'DB_CLIENT_CACHE:InstallWorkbench390/installcd',
            {'ALL': true, 'CLONE': true}, undefined, '..copied');
        expect(communicator.protect).toHaveBeenCalledTimes(0);
    });

    it('does not call installerLG to install workbench', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledWith('DH0:s/startup-sequence', 'DB_EXECUTION:wb3.9_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench390 = new InstallWorkbench390();
        await expect(installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(patch.run).toHaveBeenCalledTimes(1);
    });
});

describe('setting up the new workbench', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(true);
    });

    it('copys AUX: to devs and adds newshell to user-startup', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.copy)
            .toHaveBeenCalledWith('dh0:storage/dosdrivers/aux', 'dh0:devs/dosdrivers/aux', {'CLONE': true});
        expect(communicator.copy)
            .toHaveBeenCalledWith('dh0:storage/dosdrivers/aux.info', 'dh0:devs/dosdrivers/aux.info', {'CLONE': true});
        expect(communicator.echo).toHaveBeenCalledWith('newshell AUX:', {'>>': 'dh0:s/user-startup'});
    });

    it('ejects the floppies and restarts', async () => {
        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(winUAETools.ejectFloppy).toHaveBeenCalledWith('duckbench:c/', 1, communicator, pluginStore);
        expect(winUAETools.ejectFloppy).toHaveBeenCalledWith('duckbench:c/', 2, communicator, pluginStore);
        expect(winUAETools.restart).toHaveBeenCalledWith('duckbench:c/', communicator, pluginStore);
    });

    it('when no WORK: partition is being created it creates the Work folder and adds assigns', async () => {
        communicator.assign.mockImplementation((command, options, communicator, callback) => {
            if (callback) {
                callback({message: 'DATA_EVENT', data: '!NOTWORK!! [MOUNTED]'});
            }
            return Promise.resolve(['']);
        });

        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.makedir).toHaveBeenCalledWith('dh0:Work');
        expect(communicator.copy).toHaveBeenCalledWith('dh0:Tools.info', 'dh0:Work.info');
        expect(communicator.echo).toHaveBeenCalledWith('assign WORK: dh0:Work', {'>>': 'dh0:s/user-startup'});
    });

    it('when WORK: partition is being created it does not create a Work folder', async () => {
        communicator.assign.mockImplementation((command, options, communicator, callback) => {
            if (callback) {
                callback({message: 'DATA_EVENT', data: 'WORK [MOUNTED]'});
            }
            return Promise.resolve(['']);
        });

        const installWorkbench390 = new InstallWorkbench390();
        await installWorkbench390.install(config, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.makedir).not.toHaveBeenCalledWith('dh0:Work');
        expect(communicator.copy).not.toHaveBeenCalledWith('dh0:Tools.info', 'dh0:Work.info');
        expect(communicator.echo).not.toHaveBeenCalledWith('assign WORK: dh0:Work', {'>>': 'dh0:s/user-startup'});
    });
});
