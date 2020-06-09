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

    prepare() {
        const patchSource = path.join(__dirname, 'wb3.1_install.patch');
        const patchDestination = path.join(global.TOOLS_DIR, 'wb3.1_install.patch');
        Logger.debug(`Copying workbench 3.1 install script patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);

        const installKeySource = path.join(__dirname, 'install_key');
        const installKeyDestination = path.join(global.TOOLS_DIR, 'install_key');
        Logger.debug(`Copying workbench 3.1 install script redirected input file from "${installKeySource}" to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);
    }

    async install(config, communicator, pluginStore) {
        const unADF = pluginStore.getPlugin('UnADF');
        for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
            const fileName = workbenchDisks[diskIndex];
            await unADF.run('DB_OS_DISKS:', fileName, 'duckbench:disks/', 'duckbench:', {}, communicator);
        }

        await communicator.assign('Install3.1:', 'duckbench:disks/Install3.1');

        const patch = pluginStore.getPlugin('Patch');
        await patch.run('Install3.1:Install/Install', 'DB_TOOLS:wb3.1_install.patch', 'duckbench:c/', {}, communicator);

        const installerLg = pluginStore.getPlugin('InstallerLG');
        const installOptions = {REDIRECT_IN: 'DB_TOOLS:install_key'};
        await installerLg.run('Install3.1:install/install', installOptions, communicator,
            this.handleInstallUpdates, 'The installation of Release 3.1 is now complete.');
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
        const saveLocation = path.join(process.cwd(), 'Workbench.hdf');
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench310;
