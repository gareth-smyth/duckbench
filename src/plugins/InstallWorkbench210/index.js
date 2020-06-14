const fs = require('fs');
const path = require('path');

const workbenchDisks = [
    {file: 'amiga-os-210-install.adf', diskName: 'Install2.1', assign: 'Install2.1:'},
    {file: 'amiga-os-210-workbench.adf', diskName: 'Workbench2.1', assign: 'Workbench2.1:'},
    {file: 'amiga-os-210-locale.adf', diskName: 'Locale', assign: 'Locale:'},
    {file: 'amiga-os-210-fonts.adf', diskName: 'Fonts', assign: 'Fonts:'},
    {file: 'amiga-os-210-extras.adf', diskName: 'Extras2.1', assign: 'Extras2.1:'},
];

class InstallWorkbench210 {
    structure() {
        return {
            name: 'InstallWorkbench210',
            label: 'Workbench 2.1',
            type: 'workbench',
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
        const patchSource = path.join(__dirname, 'wb2.1_install.patch');
        const patchDestination = path.join(environmentSetup.executionFolder, 'wb2.1_install.patch');
        Logger.debug(`Copying workbench 2.1 install script patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);

        if (!environmentSetup.floppyDrive) {
            const floppyPatchSource = path.join(__dirname, 'wb2.1_no_floppy_startup.patch');
            const floppyPatchDestination = path.join(environmentSetup.executionFolder, 'wb2.1_no_floppy_startup.patch');
            Logger.debug(`Copying startup sequence no floppy patch file from "${floppyPatchSource}" ` +
                `to "${floppyPatchDestination}".`);
            fs.copyFileSync(floppyPatchSource, floppyPatchDestination);
        }

        const installKeySource = path.join(__dirname, 'install_key');
        const installKeyDestination = path.join(environmentSetup.executionFolder, 'install_key');
        Logger.debug(`Copying workbench 2.1 install script redirected input file from "${installKeySource}" ` +
            `to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);
    }

    async install(config, communicator, pluginStore, environmentSetup) {
        const patch = pluginStore.getPlugin('Patch');

        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb210_cached');
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug('Workbench 2.1 not yet cached.  Building cache.');

            await communicator.delete('DB_CLIENT_CACHE:InstallWorkbench210', {'ALL': true}, undefined, /.*/);
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench210');
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench210/wb');

            const unADF = pluginStore.getPlugin('UnADF');
            for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
                const fileName = workbenchDisks[diskIndex].file;
                await unADF.run('DB_OS_DISKS:', fileName, 'duckbench:disks/', 'duckbench:', {}, communicator);
            }

            await communicator.assign('Workbench2.1:', '', {'DISMOUNT': true});
            for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
                const target = `duckbench:disks/${workbenchDisks[diskIndex].diskName}`;
                await communicator.assign(workbenchDisks[diskIndex].assign, target);
            }

            await patch.run('"Install2.1:Install 2.1/Install 2.1"', 'DB_EXECUTION:wb2.1_install.patch',
                'duckbench:c/', {}, communicator);

            const installerLg = pluginStore.getPlugin('InstallerLG');
            const installOptions = {REDIRECT_IN: 'DB_EXECUTION:install_key'};
            await installerLg.run('"Install2.1:Install 2.1/Install 2.1"', installOptions, communicator,
                this.handleInstallUpdates, 'Installation complete');

            fs.closeSync(fs.openSync(cacheMarkerPath, 'w'));
        }

        Logger.debug('Copying workbench 2.1 files form cache.');
        await communicator.copy('DB_CLIENT_CACHE:InstallWorkbench210/wb/', 'DH0:',
            {'ALL': true, 'CLONE': true}, undefined, 'copied');

        if (!environmentSetup.floppyDrive) {
            const installedStartupSequence = 'DH0:s/startup-sequence';
            const startupSequencePatch = 'DB_EXECUTION:wb2.1_no_floppy_startup.patch';
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
        const runningLocation = path.join(environmentSetup.executionFolder, 'DH0.hdf');
        const saveLocation = path.join(process.cwd(), `Workbench210_${environmentSetup.systemName}.hdf`);
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench210;
