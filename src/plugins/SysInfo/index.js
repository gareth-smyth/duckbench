const AminetService = require('../../services/AminetService');

class SysInfo {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'SysInfo',
            label: 'SysInfo',
            description: 'Installs SysInfo from Aminet into the selected location',
            options: {
                location: {
                    name: 'location',
                    label: 'Install to',
                    description: 'e.g. "WORK:"',
                    type: 'text',
                    default: 'WORK:',
                    hide: true,
                },
            },
        };
    }

    configure() {
        return [{
            name: 'Lha',
            optionValues: {
                location: 'duckbench:c/',
            },
        }];
    }

    async prepare() {
        await AminetService.download('util/moni/SysInfo.lha');
    }

    async install(config, communicator, pluginStore) {
        if (!this.installed[config.optionValues.location]) {
            const lha = pluginStore.getPlugin('Lha');
            await lha.run('DB_HOST_CACHE:SysInfo.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
            await communicator.copy('duckbench:SysInfo', `${config.optionValues.location}SysInfo`,
                {'ALL': true, 'CLONE': true}, undefined, 'copied');
            await communicator.copy('duckbench:SysInfo.info', `${config.optionValues.location}SysInfo.info`,
                {'CLONE': true});
            await communicator.delete('duckbench:SysInfo', {ALL: true});
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing SysInfo as it has already been installed to ${config.optionValues.location}`);
        }
    }
}

module.exports = SysInfo;
