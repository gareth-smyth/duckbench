const path = require('path');
const RDBService = require('../../services/RDBService');

class Partition {
    structure() {
        return {
            name: 'Partition',
            label: 'Partition',
            description: 'Creates a new formatted partition',
            options: {
                device: {
                    name: 'device',
                    label: 'Drive name',
                    description: 'The drive to create e.g. "DH0"',
                    type: 'text',
                },
                volumeName: {
                    name: 'volumeName',
                    label: 'Volume name',
                    description: 'The name of the volume e.g. "WORK"',
                    type: 'text',
                },
                size: {
                    name: 'size',
                    label: 'Size',
                    description: 'The size of the drive in MB',
                    type: 'text',
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
        const location = path.join(process.cwd(), environmentSetup.executionFolder, `${config.optionValues.device}.hdf`);
        RDBService.createRDB(location, config.optionValues.size, config.optionValues.device);
        environmentSetup.attachHDF(config.optionValues.device, location);
    }

    async install(config, emu, pluginStore) {
        const enterFile = pluginStore.getPlugin('HitEnterFile').getFile();
        return emu.sendCommand(`format drive ${config.optionValues.device} name ${config.optionValues.volumeName} ffs quick intl noicons < ${enterFile}`);
    }
}

module.exports = Partition;
