const fs = require('fs');
const path = require('path');
const ADFService = require('../../services/ADFService');
const HardDriveService = require('../../services/HardDriveService');

class Setup {
    structure() {
        return {
            name: 'Setup',
            type: 'internal',
        };
    }

    async prepare(config, environmentSetup, settings) {
        const bootDiskFileName = path.join(environmentSetup.executionFolder, 'boot.adf');
        Logger.info(`Creating boot disk at ${bootDiskFileName}`);
        ADFService.createBootableADF(bootDiskFileName, 'DuckBoot');
        ADFService.createFile(bootDiskFileName, 'AUX', path.join(__dirname, 'amigaFiles/file_AUX'));
        ADFService.createDirectory(bootDiskFileName, '', 's');
        ADFService.createDirectory(bootDiskFileName, '', 't');
        const startupSequenceFile = path.join(__dirname, 'amigaFiles/s/file_startup-sequence');
        ADFService.createFile(bootDiskFileName, 's/startup-sequence', startupSequenceFile);

        Logger.debug('Inserting boot disk in DF0 and workbench disk in DF1.');
        environmentSetup.insertDisk('DF0', {location: bootDiskFileName});
        environmentSetup.insertDisk('DF1', {
            location: settings['InstallWorkbench310'].find((setting) => setting.name === 'workbench').value.file,
        });

        Logger.debug(`Mapping DB5: as DB_HOST_CACHE: at ${global.CACHE_DIR}`);
        environmentSetup.mapFolderToDrive('DB5', global.CACHE_DIR, 'DB_HOST_CACHE');

        Logger.debug(`Mapping DB4: as DB_TOOLS: at ${global.TOOLS_DIR}`);
        environmentSetup.mapFolderToDrive('DB4', global.TOOLS_DIR, 'DB_TOOLS');

        Logger.debug(`Mapping DB2: as DB_EXECUTION: at ${environmentSetup.executionFolder}`);
        environmentSetup.mapFolderToDrive('DB2', environmentSetup.executionFolder, 'DB_EXECUTION', true);

        const cacheLocation = path.join(global.CACHE_DIR, 'client_cache.hdf');
        if (!fs.existsSync(cacheLocation)) {
            Logger.debug('Creating DB1: as DB_CLIENT_CACHE: as new HDF');
            await HardDriveService.createRDB(cacheLocation, 250, [{driveName: 'DB1', fileSystem: 'pfs', size: 250}]);
        } else {
            Logger.debug('Using existing HDF as DB1: as DB_CLIENT_CACHE:');
        }
        environmentSetup.attachHDF('DB1', cacheLocation);

        Logger.debug('Creating DB0: as DUCKBENCH: as new HDF');
        const location = path.join(environmentSetup.executionFolder, 'duckbench.hdf');
        await HardDriveService.createRDB(location, 100, [{driveName: 'DB0', fileSystem: 'pfs', size: 100}]);
        environmentSetup.attachHDF('DB0', location);
    }

    async install(config, communicator, pluginStore) {
        const enterFile = await pluginStore.getPlugin('RedirectInputFile').createInput([''], communicator);

        try {
            const expectedResponse = 'DB_CLIENT_CACHE: not assigned';
            await communicator.assign('DB_CLIENT_CACHE:', '', {'EXISTS': true}, undefined, expectedResponse);
            Logger.debug('Formatting DB1: as DB_CLIENT_CACHE: as new HDF');
            await communicator.format('DB1', 'DB_CLIENT_CACHE', {
                ffs: true, quick: true, intl: true, noicons: true, REDIRECT_IN: enterFile,
            });
        } catch (err) {
            Logger.debug('Using existing formatted HDF as DB1: as DB_CLIENT_CACHE:');
        }

        Logger.debug('Format DUCKBENCH: partition');
        await communicator.format('DB0', 'DUCKBENCH', {
            ffs: true, quick: true, intl: true, noicons: true, REDIRECT_IN: enterFile,
        });

        await communicator.makedir('duckbench:c');
        await communicator.path('duckbench:c', {ADD: true});
        await communicator.makedir('duckbench:t');
        await communicator.makedir('duckbench:envarc');
        await communicator.makedir('duckbench:disks');
        await communicator.assign('t:', 'duckbench:t');
        await communicator.assign('envarc:', 'duckbench:envarc');
    }
}

module.exports = Setup;
