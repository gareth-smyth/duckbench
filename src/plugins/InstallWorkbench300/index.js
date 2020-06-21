const fs = require('fs');
const path = require('path');

const workbenchDisks = [
    {file: 'amiga-os-300-install.adf', diskName: 'Install3.0', assign: 'Install3.0:'},
    {file: 'amiga-os-300-workbench.adf', diskName: 'Workbench3.0', assign: 'Workbench3.0:'},
    {file: 'amiga-os-300-locale.adf', diskName: 'Locale', assign: 'Locale:'},
    {file: 'amiga-os-300-fonts.adf', diskName: 'Fonts', assign: 'Fonts:'},
    {file: 'amiga-os-300-extras.adf', diskName: 'Extras3.0', assign: 'Extras3.0:'},
    {file: 'amiga-os-300-storage.adf', diskName: 'Storage3.0', assign: 'Storage3.0:'},
];

class InstallWorkbench300 {
    structure() {
        return {
            name: 'InstallWorkbench300',
            label: 'Workbench 3.0',
            type: 'workbench',
            options: {
                device: {
                    name: 'device',
                    label: 'On drive',
                    description: 'The drive to install workbench on e.g. "WORKBENCH"',
                    type: 'partition',
                    primary: true,
                },
            },
        };
    }

    configure() {
        return [{
            name: 'UnADF',
            optionValues: {
                location: 'duckbench:',
            },
        }, {
            name: 'Patch',
            optionValues: {
                location: 'duckbench:c/',
            },
        }, {
            name: 'InstallerLG',
            optionValues: {
                location: 'duckbench:c/',
            },
        }];
    }

    prepare(config, environmentSetup) {
        const patchSource = path.join(__dirname, 'wb3.0_install.patch');
        const patchDestination = path.join(environmentSetup.executionFolder, 'wb3.0_install.patch');
        Logger.debug(`Copying workbench 3.0 install script patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);

        if (!environmentSetup.floppyDrive) {
            const floppyPatchSource = path.join(__dirname, 'wb3.0_no_floppy_startup.patch');
            const floppyPatchDestination = path.join(environmentSetup.executionFolder, 'wb3.0_no_floppy_startup.patch');
            Logger.debug(`Copying startup sequence no floppy patch file from "${floppyPatchSource}" ` +
                `to "${floppyPatchDestination}".`);
            fs.copyFileSync(floppyPatchSource, floppyPatchDestination);
        }

        const installKeySource = path.join(__dirname, 'install_key');
        const installKeyDestination = path.join(environmentSetup.executionFolder, 'install_key');
        Logger.debug(`Copying workbench 3.0 install script redirected input file from "${installKeySource}" ` +
            `to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);
    }

    async install(config, communicator, pluginStore, environmentSetup) {
        const patch = pluginStore.getPlugin('Patch');
        const unADF = pluginStore.getPlugin('UnADF');
        const installerLg = pluginStore.getPlugin('InstallerLG');

        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb300_cached');
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug('Workbench 3.0 not yet cached.  Building cache.');

            await communicator.delete('DB_CLIENT_CACHE:InstallWorkbench300', {'ALL': true}, undefined, /.*/);
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench300');
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench300/wb');

            for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
                const fileName = workbenchDisks[diskIndex].file;
                await unADF.run('DB_OS_DISKS:', fileName, 'duckbench:disks/', 'duckbench:', {}, communicator);
            }

            for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
                const target = `duckbench:disks/${workbenchDisks[diskIndex].diskName}`;
                await communicator.assign(workbenchDisks[diskIndex].assign, target);
            }

            const patchFile = 'DB_EXECUTION:wb3.0_install.patch';
            await patch.run('Install3.0:Install/Install', patchFile, 'duckbench:c/', {}, communicator);

            const installOptions = {REDIRECT_IN: 'DB_EXECUTION:install_key'};
            await installerLg.run('Install3.0:install/install', installOptions, communicator,
                this.handleInstallUpdates, 'The installation of Release 3 is now complete.');

            fs.closeSync(fs.openSync(cacheMarkerPath, 'w'));
        }

        Logger.debug('Copying workbench 3.0 files from cache.');
        await communicator.copy('DB_CLIENT_CACHE:InstallWorkbench300/wb/', `${config.optionValues.device}:`,
            {'ALL': true, 'CLONE': true}, undefined, 'copied');

        if (!environmentSetup.floppyDrive) {
            const installedStartupSequence = `${config.optionValues.device}:s/startup-sequence`;
            const startupSequencePatch = 'DB_EXECUTION:wb3.0_no_floppy_startup.patch';
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
        const saveLocation = path.join(process.cwd(), `Workbench300_${environmentSetup.systemName}.hdf`);
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench300;
