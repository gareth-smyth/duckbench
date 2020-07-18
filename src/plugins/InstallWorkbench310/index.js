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
        }, {
            name: 'WinUAETools',
            optionValues: {
                location: 'duckbench:c/',
            },
        }];
    }

    prepare(config, environmentSetup) {
        const patchSource = path.join(__dirname, 'wb3.1_install.patch');
        const patchDestination = path.join(environmentSetup.executionFolder, 'wb3.1_install.patch');
        Logger.debug(`Copying workbench 3.1 install script patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);

        if (!environmentSetup.floppyDrive) {
            const floppyPatchSource = path.join(__dirname, 'wb3.1_no_floppy_startup.patch');
            const floppyPatchDestination = path.join(environmentSetup.executionFolder, 'wb3.1_no_floppy_startup.patch');
            Logger.debug(`Copying startup sequence no floppy patch file from "${floppyPatchSource}" ` +
                `to "${floppyPatchDestination}".`);
            fs.copyFileSync(floppyPatchSource, floppyPatchDestination);
        }

        const installKeySource = path.join(__dirname, 'install_key');
        const installKeyDestination = path.join(environmentSetup.executionFolder, 'install_key');
        Logger.debug(`Copying workbench 3.1 install script redirected input file from "${installKeySource}" ` +
            `to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);
    }

    async install(config, communicator, pluginStore, environmentSetup) {
        const patch = pluginStore.getPlugin('Patch');
        const unADF = pluginStore.getPlugin('UnADF');
        const installerLg = pluginStore.getPlugin('InstallerLG');
        const winUAETools = pluginStore.getPlugin('WinUAETools');

        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb310_cached');
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug('Workbench 3.1 not yet cached. Building cache.');

            await communicator.delete('DB_CLIENT_CACHE:InstallWorkbench310', {'ALL': true}, undefined, /.*/);
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench310');
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench310/wb');

            for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
                const fileName = workbenchDisks[diskIndex];
                await unADF.run('DB_OS_DISKS:', fileName, 'duckbench:disks/', 'duckbench:', {}, communicator);
            }

            await communicator.assign('Install3.1:', 'duckbench:disks/Install3.1');

            await patch.run('Install3.1:Install/Install', 'DB_EXECUTION:wb3.1_install.patch',
                'duckbench:c/', {}, communicator);

            const installOptions = {REDIRECT_IN: 'DB_EXECUTION:install_key'};
            await installerLg.run('Install3.1:install/install', installOptions, communicator,
                this.handleInstallUpdates, 'The installation of Release 3.1 is now complete.');

            fs.closeSync(fs.openSync(cacheMarkerPath, 'w'));
        }

        Logger.debug('Copying workbench 3.1 files from cache.');
        await communicator.copy('DB_CLIENT_CACHE:InstallWorkbench310/wb/', 'DH0:',
            {'ALL': true, 'CLONE': true}, undefined, 'copied');

        if (!environmentSetup.floppyDrive) {
            const installedStartupSequence = 'DH0:s/startup-sequence';
            const startupSequencePatch = 'DB_EXECUTION:wb3.1_no_floppy_startup.patch';
            await patch.run(installedStartupSequence, startupSequencePatch, 'duckbench:c/', {}, communicator);
        }

        await communicator.copy('dh0:storage/dosdrivers/aux', 'dh0:devs/dosdrivers/aux', {'CLONE': true});
        await communicator.copy('dh0:storage/dosdrivers/aux.info', 'dh0:devs/dosdrivers/aux.info', {'CLONE': true});
        if (!await this.hasWorkPartition(communicator)) {
            await communicator.makedir('dh0:Work');
            await communicator.copy('dh0:Tools.info', 'dh0:Work.info');
            await communicator.echo('assign WORK: dh0:Work', {'>>': 'dh0:s/user-startup'});
        }
        await communicator.echo('newshell AUX:', {'>>': 'dh0:s/user-startup'});

        await winUAETools.ejectFloppy('duckbench:c/', 1, communicator, pluginStore);
        await winUAETools.ejectFloppy('duckbench:c/', 2, communicator, pluginStore);
        await winUAETools.restart('duckbench:c/', communicator, pluginStore);
    }

    async hasWorkPartition(communicator) {
        let workPartition = false;
        await communicator.assign('', '', {}, (event) => {
            if (event.message === 'DATA_EVENT' && event.data.match(/WORK \[MOUNTED]/)) {
                workPartition = true;
            }
        }, 'Volumes:');
        return workPartition;
    }

    handleInstallUpdates(event) {
        if (event.message === 'DATA_EVENT' && event.data.substr(0, 9) === 'Progress:') {
            Logger.info(event.data.substr(10));
        } else {
            Logger.trace(JSON.stringify(event));
        }
    }

    finalise(config, environmentSetup) {
        const runningLocation = path.join(environmentSetup.executionFolder, 'NewWorkbench.hdf');
        const saveLocation = path.join(process.cwd(), `Workbench310_${environmentSetup.systemName}.hdf`);
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench310;
