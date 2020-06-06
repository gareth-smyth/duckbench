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
            await unADF.run('DB_OS_DISKS:', workbenchDisks[diskIndex], 'duckbench:disks/', 'duckbench:', communicator)
                .catch((error) => {
                    throw Error(`Could not extract workbench disk ${workbenchDisks[diskIndex]} with error ${error}`);
                });
        }

        await communicator.sendCommand('assign Install3.1: duckbench:disks/Install3.1').then((response) => {
            if (response.length > 0) {
                throw new Error(`Expected no response when assigning Install3.1: but got "${response}"`);
            }
            Logger.debug('Assigned Install3.1: to duckbench:disks/Install3.1');
        }).catch((err) => {
            throw new Error(err);
        });

        await communicator.sendCommand('patch Install3.1:Install/Install DB_TOOLS:wb3.1_install.patch')
            .then((response) => {
                const responseJoin = response.join();
                if (response.length === 0 || !responseJoin.includes('done') || !responseJoin.includes('succeeded')) {
                    throw new Error(`Expected "done" and "succeeded" when patching Install3.1:Install/Install but got "${response}"`);
                }
                Logger.debug('Patched Install3.1:Install/Install');
            }).catch((err) => {
                throw new Error(err);
            });

        await communicator.sendCommand('Installer68k Install3.1:install/install < DB_TOOLS:install_key', (event) => {
            if (event.message === 'DATA_EVENT' && event.data.substr(0, 9) === 'Progress:') {
                Logger.info(event.data.substr(10));
            } else {
                Logger.trace(JSON.stringify(event));
            }
        }).then((response) => {
            const joinedResponse = response.join();
            if (response.length === 0 || !joinedResponse.includes('The installation of Release 3.1 is now complete.')) {
                throw new Error(`Expected 'The installation of Release 3.1 is now complete.' when installing Workbench 3.1 but got "${response}"`);
            }
            Logger.debug('Installed Workbench 3.1');
        }).catch((err) => {
            throw new Error(err);
        });
    }

    finalise(config, environmentSetup) {
        const runningLocation = path.join(environmentSetup.executionFolder, 'DH0.hdf');
        const saveLocation = path.join(process.cwd(), 'Workbench.hdf');
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench310;
