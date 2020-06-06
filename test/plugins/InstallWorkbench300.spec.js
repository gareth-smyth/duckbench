const fs = require('fs');
const path = require('path');

const InstallWorkbench300 = require('../../src/plugins/InstallWorkbench300');

jest.mock('fs');

beforeEach(() => {
    fs.copyFileSync.mockReset();
    global.Logger = {info: jest.fn(), trace: jest.fn(), debug: jest.fn()};
});

const standardConfig = {
    optionValues: {
        device: 'dh0:',
        volumeName: 'Workbench',
        size: 100,
    },
};

describe('configure', () => {
    it('returns UnADF dependency', () => {
        const installWorkbench300 = new InstallWorkbench300();
        const config = installWorkbench300.configure(standardConfig);

        expect(config[0]).toEqual({
            name: 'UnADF',
            optionValues: {
                location: 'duckbench:',
            },
        });
    });

    it('returns Patch as a dependency', () => {
        const installWorkbench300 = new InstallWorkbench300();
        const config = installWorkbench300.configure(standardConfig);

        expect(config[1]).toEqual({
            name: 'Patch',
            optionValues: {
                location: 'duckbench:c/',
            },
        });
    });

    it('returns InstallerLG as a dependency', () => {
        const installWorkbench300 = new InstallWorkbench300();
        const config = installWorkbench300.configure(standardConfig);

        expect(config[2]).toEqual({
            name: 'InstallerLG',
            optionValues: {
                location: 'duckbench:c/',
            },
        });
    });
});

describe('prepare', () => {
    it('copies the installer patch', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.prepare();

        const expectedCopyFrom = path.join(__dirname, '../../src/plugins/InstallWorkbench300', 'wb3.0_install.patch');
        const expectedCopyTo = path.join(process.cwd(), 'external_tools/wb3.0_install.patch');
        expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
    });

    it('copies the install key', async () => {
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.prepare();

        const expectedCopyFrom = path.join(__dirname, '../../src/plugins/InstallWorkbench300', 'install_key');
        const expectedCopyTo = path.join(process.cwd(), 'external_tools/install_key');
        expect(fs.copyFileSync).toHaveBeenCalledWith(expectedCopyFrom, expectedCopyTo);
    });
});

describe('install', () => {
    const pluginStore = { };
    const unADF = {run: jest.fn()};
    const communicator = {sendCommand: jest.fn()};

    beforeEach(() => {
        pluginStore.getPlugin = jest.fn();
        pluginStore.getPlugin.mockReturnValue(unADF);
        unADF.run.mockReset();
        unADF.run.mockResolvedValue({});
        communicator.sendCommand.mockReset();
    });

    it('calls unADF for each workbench disk', async () => {
        communicator.sendCommand.mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['done', 'succeeded'])
            .mockResolvedValueOnce(['The installation of Release 3 is now complete.']);
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install({}, communicator, pluginStore);

        expect(unADF.run).toHaveBeenCalledTimes(6);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-install.adf',
            'duckbench:disks', 'duckbench:', communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-workbench.adf',
            'duckbench:disks', 'duckbench:', communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-locale.adf',
            'duckbench:disks', 'duckbench:', communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-fonts.adf',
            'duckbench:disks', 'duckbench:', communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-extras.adf',
            'duckbench:disks', 'duckbench:', communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-storage.adf',
            'duckbench:disks', 'duckbench:', communicator);
    });

    it('throws an error if it cannot unADF a disk', async () => {
        communicator.sendCommand.mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['done', 'succeeded'])
            .mockResolvedValueOnce(['The installation of Release 3.0 is now complete.']);
        unADF.run.mockResolvedValueOnce({}).mockRejectedValueOnce('error');

        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install({}, communicator, pluginStore)).rejects.toThrow();

        expect(communicator.sendCommand).toHaveBeenCalledTimes(0);
        expect(unADF.run).toHaveBeenCalledTimes(2);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-install.adf',
            'duckbench:disks', 'duckbench:', communicator);
        expect(unADF.run).toHaveBeenCalledWith('DB_OS_DISKS:', 'amiga-os-300-workbench.adf',
            'duckbench:disks', 'duckbench:', communicator);
    });

    it('calls the communicator to assign, patch, and run the installer', async () => {
        communicator.sendCommand.mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['done', 'succeeded'])
            .mockResolvedValueOnce(['The installation of Release 3 is now complete.']);
        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install({}, communicator, pluginStore);

        expect(communicator.sendCommand).toHaveBeenCalledTimes(8);
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Install3.0: duckbench:disks/Install3.0');
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Workbench3.0: duckbench:disks/Workbench3.0');
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Extras3.0: duckbench:disks/Extras3.0');
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Locale: duckbench:disks/Locale');
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Fonts: duckbench:disks/Fonts');
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Storage3.0: duckbench:disks/Storage3.0');
        expect(communicator.sendCommand)
            .toHaveBeenCalledWith('patch Install3.0:Install/Install DB_TOOLS:wb3.0_install.patch');
        expect(communicator.sendCommand)
            .toHaveBeenCalledWith('Installer68k Install3.0:install/install < DB_TOOLS:install_key',
                expect.any(Function));
    });

    it('throws an error if assign fails', async () => {
        communicator.sendCommand.mockRejectedValueOnce('error');
        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install({}, communicator, pluginStore)).rejects.toThrow();

        expect(communicator.sendCommand).toHaveBeenCalledTimes(1);
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Install3.0: duckbench:disks/Install3.0');
    });

    it('throws an error if assign returns an unexpected response', async () => {
        communicator.sendCommand.mockResolvedValue(['some value']);
        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install({}, communicator, pluginStore)).rejects.toThrow();

        expect(communicator.sendCommand).toHaveBeenCalledTimes(1);
        expect(communicator.sendCommand).toHaveBeenCalledWith('assign Install3.0: duckbench:disks/Install3.0');
    });

    it('throws an error if patch fails', async () => {
        communicator.sendCommand.mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockRejectedValueOnce('error');
        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install({}, communicator, pluginStore)).rejects.toThrow();

        expect(communicator.sendCommand)
            .toHaveBeenCalledWith('patch Install3.0:Install/Install DB_TOOLS:wb3.0_install.patch');
    });

    it('throws an error if patch returns an unexpected response', async () => {
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValue(['some value']);
        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install({}, communicator, pluginStore)).rejects.toThrow();

        expect(communicator.sendCommand)
            .toHaveBeenCalledWith('patch Install3.0:Install/Install DB_TOOLS:wb3.0_install.patch');
    });

    it('throws an error if Installer68k fails', async () => {
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['done', 'succeeded'])
            .mockRejectedValueOnce('error');
        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install({}, communicator, pluginStore)).rejects.toThrow();

        expect(communicator.sendCommand)
            .toHaveBeenCalledWith('Installer68k Install3.0:install/install < DB_TOOLS:install_key',
                expect.any(Function));
    });

    it('throws an error if Installer68k returns an unexpected response', async () => {
        communicator.sendCommand
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce(['done', 'succeeded'])
            .mockResolvedValue(['some value']);
        const installWorkbench300 = new InstallWorkbench300();
        await expect(installWorkbench300.install({}, communicator, pluginStore)).rejects.toThrow();

        expect(communicator.sendCommand)
            .toHaveBeenCalledWith('Installer68k Install3.0:install/install < DB_TOOLS:install_key',
                expect.any(Function));
    });

    it('logs progress messages', async () => {
        communicator.sendCommand.mockImplementation((command, callback) => {
            if (callback) {
                callback({message: 'DATA_EVENT', data: 'Progress: 10%'});
            }
            if (command.includes('patch')) {
                return Promise.resolve(['done succeeded']);
            } else if (command.includes('Installer68k')) {
                return Promise.resolve(['The installation of Release 3 is now complete.']);
            } else {
                return Promise.resolve([]);
            }
        });

        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install({}, communicator, pluginStore);

        expect(Logger.info).toHaveBeenCalledWith('10%');
    });

    it('logs non-progress messages', async () => {
        const event = {message: 'DATA_EVENT', data: 'NotProgress: 10%'};
        communicator.sendCommand.mockImplementation((command, callback) => {
            if (callback) {
                callback(event);
            }
            if (command.includes('patch')) {
                return Promise.resolve(['done succeeded']);
            } else if (command.includes('Installer68k')) {
                return Promise.resolve(['The installation of Release 3 is now complete.']);
            } else {
                return Promise.resolve([]);
            }
        });

        const installWorkbench300 = new InstallWorkbench300();
        await installWorkbench300.install({}, communicator, pluginStore);

        expect(Logger.trace).toHaveBeenCalledWith(JSON.stringify(event));
    });
});

it('copies the hard drive after installation is complete', async () => {
    const installWorkbench300 = new InstallWorkbench300();
    await installWorkbench300.finalise({}, {executionFolder: '/somefolder/'});

    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    const expectedOutputFolder = path.join(process.cwd(), 'Workbench.hdf');
    const expectedInputFolder = path.join('/somefolder/', 'DH0.hdf');
    expect(fs.copyFileSync).toHaveBeenCalledWith(expectedInputFolder, expectedOutputFolder);
});
