const AminetService = require('../../services/AminetService');

class MMULib {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'MMULib',
            label: 'MMULib',
            description: 'Installs MMULib from Aminet into the selected location',
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
            name: 'InstallerLG',
            optionValues: {
                location: 'duckbench:c/',
            },
        }, {
            name: 'Lha',
            optionValues: {
                location: 'duckbench:c/',
            },
        }];
    }

    async prepare() {
        await AminetService.download('util/libs/MMULib.lha');
    }

    async install(config, communicator, pluginStore) {
        if (!this.installed[config.optionValues.location]) {
            const lha = pluginStore.getPlugin('Lha');
            await lha.run('DB_HOST_CACHE:MMULib.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
            await communicator.copy('duckbench:MMULib', `${config.optionValues.location}MMULib`,
                {'ALL': true, 'CLONE': true}, undefined, 'copied');
            await communicator.copy('duckbench:MMULib/Libs/mmu.library', 'DH0:libs/', {'CLONE': true});
            await communicator.echo(`${config.optionValues.location}MMULib/MUTools/MuFastRom`,
                {'on': true, 'Protect': true, '>>': 'dh0:s/user-startup'});
            await communicator.delete('duckbench:MMULib', {ALL: true});
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing MMULib as it has already been installed to ${config.optionValues.location}`);
        }
    }
}

module.exports = MMULib;
