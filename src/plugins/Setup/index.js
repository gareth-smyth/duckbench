const fs = require('fs');
const path = require('path');
const ADFService = require('../../services/ADFService');
const HitEnterFile = require('../HitEnterFile');
const RDBService = require('../../services/RDBService');

class Setup {
    structure() {
        return {
            name: 'Setup',
            type: 'internal',
        };
    }

    prepare(config, environmentSetup) {
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
            type: 'amigaos',
            name: environmentSetup.getWorkbenchDiskFileName(),
        });

        Logger.debug(`Mapping DB5: as DB_HOST_CACHE: at ${global.CACHE_DIR}`);
        environmentSetup.mapFolderToDrive('DB5', global.CACHE_DIR, 'DB_HOST_CACHE');

        Logger.debug(`Mapping DB4: as DB_TOOLS: at ${global.TOOLS_DIR}`);
        environmentSetup.mapFolderToDrive('DB4', global.TOOLS_DIR, 'DB_TOOLS');

        Logger.debug(`Mapping DB3: as DB_OS_DISKS: at ${environmentSetup.duckbenchConfig.osFolder}`);
        environmentSetup.mapFolderToDrive('DB3', environmentSetup.duckbenchConfig.osFolder, 'DB_OS_DISKS');

        Logger.debug(`Mapping DB2: as DB_EXECUTION: at ${environmentSetup.executionFolder}`);
        environmentSetup.mapFolderToDrive('DB2', environmentSetup.executionFolder, 'DB_EXECUTION');

        const cacheLocation = path.join(global.CACHE_DIR, 'client_cache.hdf');
        if (!fs.existsSync(cacheLocation)) {
            Logger.debug('Creating DB1: as DB_CLIENT_CACHE: as new HDF');
            RDBService.createRDB(cacheLocation, 100, 'DB1');
        } else {
            Logger.debug('Using existing HDF as DB1: as DB_CLIENT_CACHE:');
        }
        environmentSetup.attachHDF('DB1', cacheLocation);

        Logger.debug('Creating DB0: as DUCKBENCH: as new HDF');
        const location = path.join(environmentSetup.executionFolder, 'duckbench.hdf');
        RDBService.createRDB(location, 100, 'DB0');
        environmentSetup.attachHDF('DB0', location);
    }

    async install(config, communicator, pluginStore) {
        const hitEnterFile = new HitEnterFile();
        await hitEnterFile.install({}, communicator);
        const enterFile = pluginStore.getPlugin('HitEnterFile').getFile();

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
        await communicator.makedir('duckbench:disks');
        await communicator.assign('t:', 'duckbench:t');
    }
}

module.exports = Setup;
