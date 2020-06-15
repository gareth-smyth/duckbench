const AminetService = require('../../services/AminetService');

class Lha {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'Lha',
            label: 'LHA',
            description: 'Installs LHA tools (all processor versions) at selected location.',
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

    async prepare() {
        await AminetService.download('util/arc/lha.run');
    }

    async install(config, communicator) {
        if (!this.installed[config.optionValues.location]) {
            const commandString = `DB_HOST_CACHE:lha.run -x ${config.optionValues.location}`;
            await communicator.run(commandString, {}, undefined, 'Extracting: lha_68k');
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing LHA as it has already been installed to ${config.optionValues.location}`);
        }
    }

    async run(sourceFile, destination, lhaLocation, lhaOptions, communicator, commandCallback) {
        const commandString = `${lhaLocation}lha_68k x ${sourceFile} ${destination}`;
        await communicator.run(commandString, lhaOptions, commandCallback, 'Operation successful.');
    }
}

module.exports = Lha;
