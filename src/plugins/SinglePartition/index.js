const path = require('path');
const HardDriveService = require('../../services/HardDriveService');

class SinglePartition {
    structure() {
        return {
            name: 'SinglePartition',
            label: 'Single partition',
            description: 'Creates a new formatted partition',
            type: 'partition',
            options: {
                device: {
                    name: 'device',
                    label: 'Drive name',
                    description: 'The drive to install workbench on e.g. "DH0"',
                    type: 'text',
                    default: 'DH0',
                },
                volumeName: {
                    name: 'volumeName',
                    label: 'Volume name',
                    description: 'The name of the volume e.g. "WORKBENCH"',
                    type: 'text',
                    default: 'WORKBENCH',
                },
                size: {
                    name: 'size',
                    label: 'Size in MB',
                    description: 'The size of the drive in MB',
                    type: 'text',
                    default: '100',
                    primary: true,
                },
                fileSystem: {
                    name: 'fileSystem',
                    label: 'FileSystem',
                    description: 'The file system for the partition',
                    type: 'list',
                    items: [
                        {label: 'Fast File System (FFS)', value: 'ffs'},
                        {label: 'Professional File System (PFS)', value: 'pfs'},
                    ],
                    default: 'ffs',
                },
            },
        };
    }

    configure() {
        return [{
            name: 'HitEnterFile',
        }];
    }

    async prepare(config, environmentSetup) {
        const location = path.join(environmentSetup.executionFolder, `${config.optionValues.device}.hdf`);
        await HardDriveService.createRDB(location, config.optionValues.size, [
            {driveName: config.optionValues.device, fileSystem: config.optionValues.fileSystem},
        ]);
        environmentSetup.attachHDF(config.optionValues.device, location);
    }

    async install(config, communicator, pluginStore) {
        const enterFile = pluginStore.getPlugin('HitEnterFile').getFile();
        await communicator.format(config.optionValues.device, config.optionValues.volumeName, {
            ffs: true, quick: true, intl: true, noicons: true, REDIRECT_IN: enterFile,
        });
        await communicator.assign('NEW_WORKBENCH:', `${config.optionValues.volumeName}:`);
    }
}

module.exports = SinglePartition;
