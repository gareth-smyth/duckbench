const AminetService = require('../../services/AminetService');

class Check4GB {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'check4gb',
            label: 'Check4GB',
            description: 'Installs Check4GB from Aminet into the selected location',
            options: {
                location: {
                    name: 'location',
                    label: 'Install to',
                    description: 'e.g. "DH0:c/"',
                    type: 'text',
                    default: 'DH0:C/',
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
        await AminetService.download('disk/misc/check4gb.lha');
    }

    async install(config, communicator, pluginStore) {
        if (!this.installed[config.optionValues.location]) {
            const lha = pluginStore.getPlugin('Lha');
            await lha.run('DB_HOST_CACHE:check4gb.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
            await communicator.copy('duckbench:Check4GB', config.optionValues.location);
            await communicator.copy('duckbench:Check4GB.filesys', config.optionValues.location);
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing Check4GB as it has already been installed to ${config.optionValues.location}`);
        }
    }
}

module.exports = Check4GB;
