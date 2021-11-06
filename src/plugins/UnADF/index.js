const AminetService = require('../../services/AminetService');

class UnADF {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'UnADF',
            label: 'UnADF',
            description: 'Installs UnADF into the selected folder. Creates a new UnADF folder at the location given.',
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
        await AminetService.download('disk/misc/UnADF.lha');
    }

    async install(config, communicator, pluginStore) {
        if (!this.installed[config.optionValues.location]) {
            const lha = pluginStore.getPlugin('Lha');
            await lha.run('DB_HOST_CACHE:UnADF.lha', config.optionValues.location, 'duckbench:c/', {}, communicator);
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not extracting unadf as it has already been extracted to ${config.optionValues.location}`);
        }
    }

    async run(sourceLocation, sourceFile, destination, unADFLocation, unADFOptions, communicator, commandCallback) {
        await communicator.copy(`${sourceLocation}${sourceFile}`, 'duckbench:');
        await communicator.cd(`${unADFLocation}UnADF`);
        const commandString = `unadf duckbench:${sourceFile} DEST=${destination}`;
        await communicator.run(commandString, unADFOptions, commandCallback, RegExp(/Saved \d* files/));
        await communicator.protect(`duckbench:${sourceFile}`, {'d': true, 'ADD': true});
        await communicator.delete(`duckbench:${sourceFile}`);
    }
}

module.exports = UnADF;
