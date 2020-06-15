const AminetService = require('../../services/AminetService');

class Patch {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'Patch',
            label: 'Patch',
            description: 'Installs patch-2.1 from Aminet into the selected location',
            options: {
                location: {
                    name: 'location',
                    label: 'Install to',
                    description: 'e.g. "WORKBENCH:c/"',
                    type: 'text',
                    default: 'WORKBENCH:C/',
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
        await AminetService.download('dev/misc/patch-2.1.lha');
    }

    async install(config, communicator, pluginStore) {
        if (!this.installed[config.optionValues.location]) {
            const lha = pluginStore.getPlugin('Lha');
            await lha.run('DB_HOST_CACHE:patch-2.1.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
            await communicator.copy('duckbench:patch-2.1/c/patch', config.optionValues.location);
            await communicator.delete('duckbench:patch-2.1', {ALL: true});
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing patch as it has already been installed to ${config.optionValues.location}`);
        }
    }

    async run(target, patchFile, patchLocation, patchOptions, communicator,
              commandCallback, expectedResponse = ['succeeded', 'done']) {
        const commandString = `${patchLocation}patch ${target} ${patchFile}`;
        await communicator.run(commandString, patchOptions, commandCallback, expectedResponse);
    }
}

module.exports = Patch;
