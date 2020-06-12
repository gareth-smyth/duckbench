const fs = require('fs');
const path = require('path');
const request = require('request-promise');

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
        if (!fs.existsSync(path.join(global.TOOLS_DIR, 'lha.run'))) {
            Logger.debug('Downloading lha.run from http://aminet.net/util/arc/lha.run');
            const response = await request({
                uri: 'http://aminet.net/util/arc/lha.run',
                resolveWithFullResponse: true,
                encoding: null,
            }).catch((err) => {
                throw new Error(err);
            });
            fs.writeFileSync(path.join(global.TOOLS_DIR, 'lha.run'), response.body);
        } else {
            Logger.debug('Using cached version of lha.run');
        }
    }

    async install(config, communicator) {
        if (!this.installed[config.optionValues.location]) {
            const commandString = `DB_TOOLS:lha.run -x ${config.optionValues.location}`;
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
