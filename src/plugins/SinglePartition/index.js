const path = require('path');
const RDBService = require('../../services/RDBService');

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
                    hide: true,
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
            },
        };
    }

    configure() {
        return [{
            name: 'HitEnterFile',
        }];
    }

    prepare(config, environmentSetup) {
        const location = path.join(environmentSetup.executionFolder, `${config.optionValues.device}.hdf`);
        RDBService.createRDB(location, config.optionValues.size, config.optionValues.device);
        environmentSetup.attachHDF(config.optionValues.device, location);
    }

    async install(config, emu, pluginStore) {
        const enterFile = pluginStore.getPlugin('HitEnterFile').getFile();
        return emu.sendCommand(`format drive ${config.optionValues.device} name ${config.optionValues.volumeName} ffs quick intl noicons < ${enterFile}`);
    }
}

module.exports = SinglePartition;
