const fs = require('fs-extra');
const path = require('path');

class InstallWorkbench390 {
    async structure() {
        return {
            name: 'InstallWorkbench390',
            label: 'Workbench 3.9',
            type: 'workbench',
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
        }, {
            name: 'WinUAETools',
            optionValues: {
                location: 'duckbench:c/',
            },
        }];
    }

    prepare(config, environmentSetup, settings) {
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

        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb390_cached');
        if (!fs.existsSync(cacheMarkerPath)) {
            const isoLocation = settings['InstallWorkbench390'].find((setting) => setting.name === 'isoLocation');
            environmentSetup.insertCDISO(isoLocation.value.file);
        }
    }

    async install(config, communicator, pluginStore, environmentSetup) {
        const patch = pluginStore.getPlugin('Patch');
        const installerLg = pluginStore.getPlugin('InstallerLG');
        const winUAETools = pluginStore.getPlugin('WinUAETools');

        const cacheMarkerPath = path.join(global.CACHE_DIR, 'wb390_cached');
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug('Workbench 3.9 not yet cached. Building cache.');

            await communicator.delete('DB_CLIENT_CACHE:InstallWorkbench390', {'ALL': true}, undefined, /.*/);
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench390');
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench390/wb');
            await communicator.makedir('DB_CLIENT_CACHE:InstallWorkbench390/installcd');
            await communicator.copy('CD0:OS-Version3.9', 'DB_CLIENT_CACHE:InstallWorkbench390/installcd',
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
        await communicator.copy('DB_CLIENT_CACHE:InstallWorkbench390/wb', 'DH0:',
            {'ALL': true, 'CLONE': true}, undefined, 'copied');

        if (!environmentSetup.floppyDrive) {
            const installedStartupSequence = 'DH0:s/startup-sequence';
            const startupSequencePatch = 'DB_EXECUTION:wb3.9_no_floppy_startup.patch';
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
        const saveLocation = path.join(process.cwd(), `Workbench390_${environmentSetup.systemName}.hdf`);
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench390;
