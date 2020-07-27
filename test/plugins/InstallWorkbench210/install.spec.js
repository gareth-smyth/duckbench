const fs = require('fs');
const InstallWorkbench210 = require('../../../src/plugins/InstallWorkbench210');

const Communicator = require('../../../src/builder/Communicator');
const PluginStore = require('../../../src/builder/PluginStore');
const InstallLG = require('../../../src/plugins/InstallerLG');
const Patch = require('../../../src/plugins/Patch');
const UnADF = require('../../../src/plugins/UnADF');
const WinUAETools = require('../../../src/plugins/WinUAETools');

jest.mock('fs');
jest.mock('../../../src/builder/Communicator');
jest.mock('../../../src/builder/PluginStore');
jest.mock('../../../src/plugins/InstallerLG');
jest.mock('../../../src/plugins/Patch');
jest.mock('../../../src/plugins/UnADF');
jest.mock('../../../src/plugins/WinUAETools');

let communicator;
let pluginStore;
let installerLG;
let winUAETools;
let patch;
let unADF;

beforeEach(() => {
    communicator = new Communicator();
    pluginStore = new PluginStore();
    installerLG = new InstallLG();
    patch = new Patch();
    unADF = new UnADF();
    winUAETools = new WinUAETools();
    pluginStore.getPlugin.mockReturnValueOnce(patch)
        .mockReturnValueOnce(unADF)
        .mockReturnValueOnce(installerLG)
        .mockReturnValueOnce(winUAETools);

    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

describe('when the cache does not exist', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(false);
    });

    it('deletes and recreates the wb install cache', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete)
            .toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench210', {'ALL': true}, undefined, /.*/);
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench210');
        expect(communicator.makedir).toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench210/wb');
    });

    it('calls unADF for each workbench disk', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(unADF.run).toHaveBeenCalledTimes(5);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-210-install.adf',
            'duckbench:disks/', 'duckbench:', {}, communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-210-workbench.adf',
            'duckbench:disks/', 'duckbench:', {}, communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-210-locale.adf',
            'duckbench:disks/', 'duckbench:', {}, communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-210-fonts.adf',
            'duckbench:disks/', 'duckbench:', {}, communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-210-extras.adf',
            'duckbench:disks/', 'duckbench:', {}, communicator);
    });

    it('throws an error if it cannot unADF a disk', async () => {
        unADF.run.mockResolvedValueOnce({}).mockImplementation(() => {
            throw new Error('unadf error');
        });

        const installWorkbench210 = new InstallWorkbench210();
        await expect(installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('unadf error');

        expect(unADF.run).toHaveBeenCalledTimes(2);
        expect(communicator.assign).toHaveBeenCalledTimes(0);
        expect(patch.run).toHaveBeenCalledTimes(0);
        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls the communicator to assign the install disk', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.assign).toHaveBeenCalledTimes(7);
        expect(communicator.assign).toHaveBeenCalledWith('Workbench2.1:', '', {'DISMOUNT': true});
        expect(communicator.assign).toHaveBeenCalledWith('Workbench2.1:', 'duckbench:disks/Workbench2.1');
        expect(communicator.assign).toHaveBeenCalledWith('Install2.1:', 'duckbench:disks/Install2.1');
        expect(communicator.assign).toHaveBeenCalledWith('Locale:', 'duckbench:disks/Locale');
        expect(communicator.assign).toHaveBeenCalledWith('Fonts:', 'duckbench:disks/Fonts');
        expect(communicator.assign).toHaveBeenCalledWith('Extras2.1:', 'duckbench:disks/Extras2.1');
    });

    it('calls the communicator to discover if there is a work partition', async () => {
        const installWorkbench310 = new InstallWorkbench210();
        await installWorkbench310.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.assign).toHaveBeenCalledTimes(7);
        expect(communicator.assign).toHaveBeenCalledWith('', '', {}, expect.any(Function), 'Volumes:');
    });


    it('throws an error if assign fails', async () => {
        communicator.assign.mockImplementation(() => {
            throw new Error('assign error');
        });
        const installWorkbench210 = new InstallWorkbench210();
        await expect(installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('assign error');

        expect(unADF.run).toHaveBeenCalledTimes(5);
        expect(communicator.assign).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledTimes(0);
        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls patch for the install file', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledWith('"Install2.1:Install 2.1/Install 2.1"',
            'DB_EXECUTION:wb2.1_install.patch', 'duckbench:c/', {}, communicator);
    });

    it('throws an error if patch fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch error');
        });

        const installWorkbench210 = new InstallWorkbench210();
        await expect(installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('patch error');

        expect(unADF.run).toHaveBeenCalledTimes(5);
        expect(communicator.assign).toHaveBeenCalledTimes(6);
        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls installerLG to install workbench', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(installerLG.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledWith('"Install2.1:Install 2.1/Install 2.1"',
            {'REDIRECT_IN': 'DB_EXECUTION:install_key'},
            communicator, expect.any(Function), 'Installation complete');
    });

    it('throws an error if installerLG fails', async () => {
        installerLG.run.mockImplementation(() => {
            throw new Error('installerLG error');
        });

        const installWorkbench210 = new InstallWorkbench210();
        await expect(installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true}))
            .rejects.toThrowError('installerLG error');

        expect(unADF.run).toHaveBeenCalledTimes(5);
        expect(communicator.assign).toHaveBeenCalledTimes(6);
        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(installerLG.run).toHaveBeenCalledTimes(1);
    });

    it('logs progress messages', async () => {
        installerLG.run.mockImplementation((command, options, communicator, callback) => {
            if (callback) {
                callback({message: 'DATA_EVENT', data: 'Progress: 10%'});
            }
            return Promise.resolve(['Installation complete']);
        });

        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(Logger.info).toHaveBeenCalledWith('10%');
    });

    it('logs non-progress messages', async () => {
        const event = {message: 'DATA_EVENT', data: 'NotProgress: 10%'};
        installerLG.run.mockImplementation((command, options, communicator, callback) => {
            if (callback) {
                callback(event);
            }
            return Promise.resolve(['Installation complete']);
        });

        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(Logger.trace).toHaveBeenCalledWith(JSON.stringify(event));
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(2);
        expect(patch.run).toHaveBeenCalledWith('DH0:s/startup-sequence', 'DB_EXECUTION:wb2.1_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockResolvedValueOnce({}).mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench210 = new InstallWorkbench210();
        await expect(installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(unADF.run).toHaveBeenCalledTimes(5);
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
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.delete).toHaveBeenCalledTimes(0);
        expect(communicator.makedir).toHaveBeenCalledTimes(1);
        expect(communicator.makedir).not.toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench210');
        expect(communicator.makedir).not.toHaveBeenCalledWith('DB_CLIENT_CACHE:InstallWorkbench210/wb');
    });

    it('does not extract the workbench disks with ADF', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(unADF.run).toHaveBeenCalledTimes(0);
    });

    it('does not assign the install disks', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.assign).toHaveBeenCalledTimes(1);
        expect(communicator.assign).not.toHaveBeenCalledWith('Workbench2.1:', 'duckbench:disks/Workbench2.1');
    });

    it('does not patch the install file', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(patch.run).toHaveBeenCalledTimes(0);
    });


    it('does not run installerLG', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(installerLG.run).toHaveBeenCalledTimes(0);
    });

    it('calls patch for the startup sequence if there is no floppy', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: false});

        expect(patch.run).toHaveBeenCalledTimes(1);
        expect(patch.run).toHaveBeenCalledWith('DH0:s/startup-sequence', 'DB_EXECUTION:wb2.1_no_floppy_startup.patch',
            'duckbench:c/', {}, communicator);
    });

    it('throws an error if patching startup sequence fails', async () => {
        patch.run.mockImplementation(() => {
            throw new Error('patch startup error');
        });

        const installWorkbench210 = new InstallWorkbench210();
        await expect(installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: false}))
            .rejects.toThrowError('patch startup error');

        expect(patch.run).toHaveBeenCalledTimes(1);
    });
});

describe('setting up the new workbench', () => {
    beforeEach(() => {
        fs.existsSync.mockReturnValueOnce(true);
    });

    it('copys AUX: to devs and adds newshell to user-startup', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.copy)
            .toHaveBeenCalledWith('dh0:storage/dosdrivers/aux', 'dh0:devs/dosdrivers/aux', {'CLONE': true});
        expect(communicator.copy)
            .toHaveBeenCalledWith('dh0:storage/dosdrivers/aux.info', 'dh0:devs/dosdrivers/aux.info', {'CLONE': true});
        expect(communicator.echo).toHaveBeenCalledWith('newshell AUX:', {'>>': 'dh0:s/user-startup'});
    });

    it('ejects the floppies and restarts', async () => {
        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

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

        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

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

        const installWorkbench210 = new InstallWorkbench210();
        await installWorkbench210.install({}, communicator, pluginStore, {floppyDrive: true});

        expect(communicator.makedir).not.toHaveBeenCalledWith('dh0:Work');
        expect(communicator.copy).not.toHaveBeenCalledWith('dh0:Tools.info', 'dh0:Work.info');
        expect(communicator.echo).not.toHaveBeenCalledWith('assign WORK: dh0:Work', {'>>': 'dh0:s/user-startup'});
    });
});
