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

class InstallWorkbench310 {
    structure() {
        return {
            name: 'InstallWorkbench300',
            label: 'Workbench 3.0',
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
        const patchSource = path.join(__dirname, 'wb3.0_install.patch');
        const patchDestination = path.join(global.TOOLS_DIR, 'wb3.0_install.patch');
        Logger.debug(`Copying workbench 3.0 install script patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);

        const installKeySource = path.join(__dirname, 'install_key');
        const installKeyDestination = path.join(global.TOOLS_DIR, 'install_key');
        Logger.debug(`Copying workbench 3.0 install script redirected input file from "${installKeySource}" to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);
    }

    async install(config, communicator, pluginStore) {
        const unADF = pluginStore.getPlugin('UnADF');
        for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
            const fileName = workbenchDisks[diskIndex].file;
            await unADF.run('DB_OS_DISKS:', fileName, 'duckbench:disks', 'duckbench:', communicator)
                .catch((error) => {
                    throw Error(`Could not extract workbench disk ${fileName} with error ${error}`);
                });
        }

        for (let diskIndex = 0; diskIndex < workbenchDisks.length; diskIndex++) {
            const assign = workbenchDisks[diskIndex].assign;
            const diskName = workbenchDisks[diskIndex].diskName;
            await communicator.sendCommand(`assign ${assign} duckbench:disks/${diskName}`).then((response) => {
                if (response.length > 0) {
                    throw new Error(`Expected no response when assigning ${assign} but got "${response}"`);
                }
                Logger.debug(`Assigned ${assign} to duckbench:disks/${diskName}`);
            }).catch((err) => {
                throw new Error(err);
            });
        }

        await communicator.sendCommand('patch Install3.0:Install/Install DB_TOOLS:wb3.0_install.patch')
            .then((response) => {
                const responseJoin = response.join();
                if (response.length === 0 || !responseJoin.includes('done') || !responseJoin.includes('succeeded')) {
                    throw new Error(`Expected "done" and "succeeded" when patchingInstall3.0:Install/Install but got "${response}"`);
                }
                Logger.debug('Patched Install3.0:Install/Install');
            }).catch((err) => {
                throw new Error(err);
            });

        await communicator.sendCommand('Installer68k Install3.0:install/install < DB_TOOLS:install_key', (event) => {
            if (event.message === 'DATA_EVENT' && event.data.substr(0, 9) === 'Progress:') {
                Logger.info(event.data.substr(10));
            } else {
                Logger.trace(JSON.stringify(event));
            }
        }).then((response) => {
            const joinedResponse = response.join();
            if (response.length === 0 || !joinedResponse.includes('The installation of Release 3 is now complete.')) {
                throw new Error(`Expected 'The installation of Release 3 is now complete.' when installing Workbench 3.0 but got "${response}"`);
            }
            Logger.debug('Installed Workbench 3.0');
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
