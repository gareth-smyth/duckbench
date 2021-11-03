const fs = require('fs-extra');
const path = require('path');

class InstallWorkbench320 {
    constructor() {
        this.identifier = '3.2';
        this.dirName = __dirname;
        this.name = 'InstallWorkbench320';
        this.cacheName = 'wb320_cached';
        this.readableName = 'Workbench 3.2';
        this.installFileLocation = 'Install3.2:Install/Install';
        this.installationSuccessMessage = 'The installation of Release 3.2 is now complete.';
        this.disks = [
            {name: 'install', label: 'Install disk', diskName: 'Install3.2', assign: 'Install3.2:'},
            {name: 'workbench', label: 'Workbench disk', diskName: 'Workbench3.2', assign: 'Workbench3.2:'},
            {name: 'locale', label: 'Locale disk'},
            {name: 'locale-EN', label: 'Locale-EN disk'},
            {name: 'fonts', label: 'Fonts disk'},
            {name: 'extras', label: 'Extras disk', diskName: 'Extras3.2', assign: 'Extras3.2:'},
            {name: 'storage', label: 'Storage disk', diskName: 'Storage3.2', assign: 'Storage3.2:'},
            {name: 'diskdoctor', label: 'Disk doctor'},
            {name: 'classes', label: 'Classes disk', diskName: 'Classes3.2', assign: 'Classes3.2:'},
            {name: 'backdrops', label: 'Backdrops disk', diskName: 'Backdrops3.2', assign: 'Backdrops3.2:'},
            {name: 'modules1200', label: 'A1200 Modules', diskName: 'ModulesA1200_3.2', assign: 'ModulesA1200_3.2:'},
        ];
    }

    structure() {
        return {
            name: this.name,
            label: this.readableName,
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

    prepare(config, environmentSetup, settings) {
        this.copyPatchFile(environmentSetup);
        this.copyNoFloppyPatch(environmentSetup);
        this.copyInstallKey(environmentSetup);
        this.prepareDisks(settings, environmentSetup);
    }

    copyInstallKey(environmentSetup) {
        const installKeySource = path.join(this.dirName, 'files', `wb${this.identifier}_install_key`);
        const installKeyDestination = path.join(environmentSetup.executionFolder, `wb${this.identifier}_install_key`);
        Logger.debug(`Copying ${this.readableName} install script redirected input file from "${installKeySource}" ` +
            `to "${installKeyDestination}".`);
        fs.copyFileSync(installKeySource, installKeyDestination);
    }

    prepareDisks(settings, environmentSetup) {
        Logger.debug(`Copying ${this.readableName} disks`);
        for (let diskIndex = 0; diskIndex < this.disks.length; diskIndex++) {
            const diskName = this.disks[diskIndex].name;
            const fileSetting = settings[this.name].find((setting) => setting.name === diskName);
            fs.copyFileSync(fileSetting.value.file, path.join(environmentSetup.executionFolder, `${diskName}.adf`));
        }
    }

    copyNoFloppyPatch(environmentSetup) {
        if (!environmentSetup.floppyDrive) {
            const patchFileName = `wb${this.identifier}_no_floppy_startup.patch`;
            const floppyPatchSource = path.join(this.dirName, 'files', patchFileName);
            const floppyPatchDestination = path.join(environmentSetup.executionFolder, patchFileName);
            Logger.debug(`Copying startup sequence no floppy patch file from "${floppyPatchSource}" ` +
                `to "${floppyPatchDestination}".`);
            fs.copyFileSync(floppyPatchSource, floppyPatchDestination);
        }
    }

    copyPatchFile(environmentSetup) {
        const patchSource = path.join(this.dirName, 'files', `wb${this.identifier}_install.patch`);
        const patchDestination = path.join(environmentSetup.executionFolder, `wb${this.identifier}_install.patch`);
        Logger.debug(`Copying ${this.readableName} install patch file from "${patchSource}" to "${patchDestination}".`);
        fs.copyFileSync(patchSource, patchDestination);
    }

    async install(config, communicator, pluginStore, environmentSetup) {
        const patch = pluginStore.getPlugin('Patch');
        const unADF = pluginStore.getPlugin('UnADF');
        const installerLg = pluginStore.getPlugin('InstallerLG');
        const winUAETools = pluginStore.getPlugin('WinUAETools');

        await this.installToCache(communicator, unADF, patch, installerLg);

        Logger.debug(`Copying ${this.readableName} files from cache.`);
        await communicator.copy(`DB_CLIENT_CACHE:${this.name}/wb`, 'DH0:',
            {'ALL': true, 'CLONE': true}, undefined, 'copied');

        if (!environmentSetup.floppyDrive) {
            const installedStartupSequence = 'DH0:s/startup-sequence';
            const startupSequencePatch = `DB_EXECUTION:wb${this.identifier}_no_floppy_startup.patch`;
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

    async installToCache(communicator, unADF, patch, installerLg) {
        const cacheMarkerPath = path.join(global.CACHE_DIR, this.cacheName);
        if (!fs.existsSync(cacheMarkerPath)) {
            Logger.debug(`${this.readableName} not yet cached. Building cache.`);

            await communicator.delete(`DB_CLIENT_CACHE:${this.name}`, {'ALL': true}, undefined, /.*/);
            await communicator.makedir(`DB_CLIENT_CACHE:${this.name}`);
            await communicator.makedir(`DB_CLIENT_CACHE:${this.name}/wb`);

            for (let diskIndex = 0; diskIndex < this.disks.length; diskIndex++) {
                const diskName = this.disks[diskIndex].name;
                await unADF.run('DB_EXECUTION:', `${diskName}.adf`, 'duckbench:disks/', 'duckbench:', {}, communicator);
            }

            for (let diskIndex = 0; diskIndex < this.disks.length; diskIndex++) {
                const disk = this.disks[diskIndex];
                if (disk.assign) {
                    const target = `duckbench:disks/${disk.diskName}`;
                    await communicator.assign(disk.assign, target);
                }
            }

            await patch.run(this.installFileLocation, `DB_EXECUTION:wb${this.identifier}_install.patch`,
                'duckbench:c/', {}, communicator);

            const installOptions = {REDIRECT_IN: `DB_EXECUTION:wb${this.identifier}_install_key`};
            await installerLg.run(this.installFileLocation, installOptions, communicator,
                this.handleInstallUpdates, this.installationSuccessMessage);

            fs.closeSync(fs.openSync(cacheMarkerPath, 'w'));
        }
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
        const saveLocation = path.join(process.cwd(), `${this.name}_${environmentSetup.systemName}.hdf`);
        fs.copyFileSync(runningLocation, saveLocation);
    }
}

module.exports = InstallWorkbench320;
