const path = require('path');
const ADFService = require('../../services/ADFService');
const HitEnterFile = require('../HitEnterFile');
const Partition = require('../SinglePartition');

class Setup {
    structure() {
        return {
            name: 'Setup',
            type: 'internal',
        };
    }

    configure() {
        return [{
            name: 'HitEnterFile',
        }];
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
            name: 'amiga-os-310-workbench.adf',
        });

        Logger.debug(`Mapping DH6: as DB_TOOLS: at ${global.TOOLS_DIR}`);
        environmentSetup.mapFolderToDrive('DH6', global.TOOLS_DIR, 'DB_TOOLS');

        Logger.debug(`Mapping DH5: as DB_OS_DISKS: at ${environmentSetup.duckbenchConfig.osFolder}`);
        environmentSetup.mapFolderToDrive('DH5', environmentSetup.duckbenchConfig.osFolder, 'DB_OS_DISKS');

        Logger.debug('Set ROM to "amiga-os-310-a1200.rom"');
        environmentSetup.setRom('amiga-os-310-a1200.rom');

        Logger.debug('Creating DUCKBENCH: partition as DH1');
        const partition = new Partition();
        return partition.prepare({
            name: 'SinglePartition',
            optionValues: {
                device: 'DH1',
                volumeName: 'DUCKBENCH',
                size: 100,
            },
        }, environmentSetup);
    }

    async install(config, communicator, pluginStore) {
        const hitEnterFile = new HitEnterFile();
        await hitEnterFile.install({}, communicator);
        const partition = new Partition();

        Logger.debug('Install DUCKBENCH: partition');
        await partition.install({
            name: 'SinglePartition',
            optionValues: {
                device: 'DH1',
                volumeName: 'DUCKBENCH',
                size: 100,
            },
        }, communicator, pluginStore);

        await communicator.makedir('duckbench:c');
        await communicator.path('duckbench:c', {ADD: true});
        await communicator.makedir('duckbench:t');
        await communicator.makedir('duckbench:disks');
        await communicator.assign('t:', 'duckbench:t');
    }
}

module.exports = Setup;
