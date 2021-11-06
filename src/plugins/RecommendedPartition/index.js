const path = require('path');
const HardDriveService = require('../../services/HardDriveService');

class RecommendedPartition {
    structure() {
        return {
            name: 'RecommendedPartition',
            label: 'Recommended Partitions',
            description: 'Partitions in a standard way based on disk size',
            type: 'partition',
            options: {
                size: {
                    name: 'size',
                    label: 'Total disk size in MB',
                    description: 'The size of the disk in MB',
                    type: 'text',
                    default: '100',
                    primary: true,
                },
            },
        };
    }

    configure() {
        return [{
            name: 'RedirectInputFile',
        }];
    }

    async prepare(config, environmentSetup) {
        const location = path.join(environmentSetup.executionFolder, 'NewWorkbench.hdf');
        const partitions = [];
        if (config.optionValues.size > 3999) {
            const sysPartitionSize = 300;
            const workPartitionSize = config.optionValues.size - sysPartitionSize;
            partitions.push({driveName: 'DH0', fileSystem: 'pfs', size: sysPartitionSize});
            partitions.push({driveName: 'DH1', fileSystem: 'pfs', size: workPartitionSize});
        } else {
            partitions.push({driveName: 'DH0', fileSystem: 'pfs', size: config.optionValues.size});
        }
        await HardDriveService.createRDB(location, config.optionValues.size, partitions);
        environmentSetup.attachHDF('DH0', location);
    }

    async install(config, communicator, pluginStore) {
        const enterFile = await pluginStore.getPlugin('RedirectInputFile').createInput([''], communicator);
        await communicator.format('DH0', 'WORKBENCH', {
            quick: true, intl: true, noicons: true, REDIRECT_IN: enterFile,
        });
        if (config.optionValues.size > 3999) {
            await communicator.format('DH1', 'WORK', {
                quick: true, intl: true, noicons: true, REDIRECT_IN: enterFile,
            });
        } else {
            await communicator.assign('WORK:', 'DH0:');
        }
    }
}

module.exports = RecommendedPartition;
