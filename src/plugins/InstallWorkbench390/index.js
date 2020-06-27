const fs = require('fs-extra');
const path = require('path');
const diskInfo = require('node-disk-info');

class InstallWorkbench390 {
    async structure() {
        const availableDrives = await diskInfo.getDiskInfo();
        return {
            name: 'InstallWorkbench390',
            label: 'Workbench 3.9',
            type: 'workbench',
            showConfig: true,
            options: {
                device: {
                    name: 'device',
                    label: 'On drive',
                    description: 'The drive to install workbench on e.g. "WORKBENCH"',
                    type: 'partition',
                },
                iso390: {
                    name: 'iso390',
                    label: 'OS 3.9 Drive',
                    description: 'The OS 3.9 Disk on the host',
                    type: 'list',
                    items: availableDrives.map((drive) => {
                        return {
                            label: `${drive.mounted} (${drive.filesystem})`,
                            value: `${drive.mounted}`,
                        };
                    }),
                    default: availableDrives[0].device,
                },
            },
        };
    }

    configure() {
        return [{
            name: 'InstallerLG',
            optionValues: {
                location: 'duckbench:c/',
            },
        }, {
            name: 'Patch',
            optionValues: {
                location: 'duckbench:c/',
            },
        }];
    }

    prepare(config, environmentSetup) {
        const patchSource = path.join(__dirname, 'wb3.9_install.patch');
        const patchDestination = path.join(environmentSetup.executionFolder, 'wb3.9_install.patch');
        Logger.debug(`Copying workbench 3.9 install script patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);

        const installKeySource = path.join(__dirname, 'install_key');
        const installKeyDestination = path.join(environmentSetup.executionFolder, 'wb390_install_key');
        Logger.debug(`Copying workbench 3.9 install script redirected input file from "${installKeySource}" ` +
            `to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);

        if (!environmentSetup.floppyDrive) {
            const floppyPatchSource = path.join(__dirname, 'wb3.9_no_floppy_startup.patch');
            const floppyPatchDestination = path.join(environmentSetup.executionFolder, 'wb3.9_no_floppy_startup.patch');
            Logger.debug(`Copying startup sequence no floppy patch file from "${floppyPatchSource}" ` +
                `to "${floppyPatchDestination}".`);
            fs.copyFileSync(floppyPatchSource, floppyPatchDestination);
        }

        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb390_installcd_cached');
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug('Workbench 3.9 source not yet cached.  Copying to cache.');
            const installCDFolder = path.join(config.optionValues.iso390, 'OS-Version3.9');
            const cacheInstallFolder = path.join(global.CACHE_DIR, 'OS-Version3.9');
            fs.rmdirSync(cacheInstallFolder, {recursive: true});
            fs.copySync(installCDFolder, cacheInstallFolder);

            fs.closeSync(fs.openSync(cacheMarkerPath, 'w'));
        } else {
            Logger.debug('Workbench 3.9 source already in host cache - reusing.');
        }
    }

    async install(config, communicator, pluginStore, environmentSetup) {
        const patch = pluginStore.getPlugin('Patch');
        const installerLg = pluginStore.getPlugin('InstallerLG');

        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb390_cached');
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug('Workbench 3.9 not yet cached. Building cache.');

            await communicator.delete('DB_CLIENT_CACHE:InstallWorkbench390', {'ALL': true}, undefined, /.*/);
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench390');
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench390/wb');
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench390/installcd');
            await communicator.copy('DB_HOST_CACHE:OS-Version3.9', 'DB_CLIENT_CACHE:InstallWorkbench390/installcd',
                {'ALL': true, 'CLONE': true}, undefined, '..copied');
            await communicator.protect('DB_CLIENT_CACHE:InstallWorkbench390/installcd',
                {'+wd': true, 'all': true}, undefined, '..done');

            await patch.run('DB_CLIENT_CACHE:InstallWorkbench390/installcd/OS3.9Install-Emu',
                'DB_EXECUTION:wb3.9_install.patch', 'duckbench:c/', {}, communicator);

            const installOptions = {REDIRECT_IN: 'DB_EXECUTION:wb390_install_key'};
            await installerLg.run('DB_CLIENT_CACHE:InstallWorkbench390/installcd/OS3.9Install-Emu', installOptions,
                communicator, this.handleInstallUpdates, 'The installation of Release 3.9 is now complete.');

            fs.closeSync(fs.openSync(cacheMarkerPath, 'w'));
        }

        Logger.debug('Copying workbench 3.9 files from cache.');
        await communicator.copy('DB_CLIENT_CACHE:InstallWorkbench390/wb', `${config.optionValues.device}:`,
            {'ALL': true, 'CLONE': true}, undefined, 'copied');

        if (!environmentSetup.floppyDrive) {
            const installedStartupSequence = `${config.optionValues.device}:s/startup-sequence`;
            const startupSequencePatch = 'DB_EXECUTION:wb3.9_no_floppy_startup.patch';
            await patch.run(installedStartupSequence, startupSequencePatch, 'duckbench:c/', {}, communicator);
        }
    }

    handleInstallUpdates(event) {
        if (event.message === 'DATA_EVENT' && event.data.substr(0, 9) === 'Progress:') {
            Logger.info(event.data.substr(10));
        } else {
            Logger.trace(JSON.stringify(event));
        }
    }

    finalise(config, environmentSetup) {
        const runningLocation = path.join(environmentSetup.executionFolder, `${config.optionValues.device}.hdf`);
        const saveLocation = path.join(process.cwd(), `Workbench390_${environmentSetup.systemName}.hdf`);
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench390;
