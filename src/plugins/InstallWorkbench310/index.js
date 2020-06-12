const fs = require('fs');
const path = require('path');

const workbenchDisks = [
    'amiga-os-310-install.adf',
    'amiga-os-310-workbench.adf',
    'amiga-os-310-locale.adf',
    'amiga-os-310-fonts.adf',
    'amiga-os-310-extras.adf',
    'amiga-os-310-storage.adf',
];

class InstallWorkbench310 {
    structure() {
        return {
            name: 'InstallWorkbench310',
            label: 'Workbench 3.1',
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
        const patchSource = path.join(__dirname, 'wb3.1_install.patch');
        const patchDestination = path.join(global.TOOLS_DIR, 'wb3.1_install.patch');
        Logger.debug(`Copying workbench 3.1 install script patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);

        if (!environmentSetup.floppyDrive) {
            const floppyPatchSource = path.join(__dirname, 'wb3.1_no_floppy_startup.patch');
            const floppyPatchDestination = path.join(global.TOOLS_DIR, 'wb3.1_no_floppy_startup.patch');
            Logger.debug(`Copying startup sequence no floppy patch file from "${floppyPatchSource}" ` +
                `to "${floppyPatchDestination}".`);
            fs.copyFileSync(floppyPatchSource, floppyPatchDestination);
        }

        const installKeySource = path.join(__dirname, 'install_key');
        const installKeyDestination = path.join(global.TOOLS_DIR, 'install_key');
        Logger.debug(`Copying workbench 3.1 install script redirected input file from "${installKeySource}" ` +
            `to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);
    }

    async install(config, communicator, pluginStore, environmentSetup) {
        const unADF = pluginStore.getPlugin('UnADF');
        const patch = pluginStore.getPlugin('Patch');
        const installerLg = pluginStore.getPlugin('InstallerLG');

        for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
            const fileName = workbenchDisks[diskIndex];
            await unADF.run('DB_OS_DISKS:', fileName, 'duckbench:disks/', 'duckbench:', {}, communicator);
        }

        await communicator.assign('Install3.1:', 'duckbench:disks/Install3.1');

        await patch.run('Install3.1:Install/Install', 'DB_TOOLS:wb3.1_install.patch', 'duckbench:c/', {}, communicator);

        const installOptions = {REDIRECT_IN: 'DB_TOOLS:install_key'};
        await installerLg.run('Install3.1:install/install', installOptions, communicator,
            this.handleInstallUpdates, 'The installation of Release 3.1 is now complete.');

        if (!environmentSetup.floppyDrive) {
            const installedStartupSequence = 'DH0:s/startup-sequence';
            const startupSequencePatch = 'DB_TOOLS:wb3.1_no_floppy_startup.patch';
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
        const saveLocation = path.join(process.cwd(), `Workbench310_${environmentSetup.systemName}.hdf`);
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench310;
