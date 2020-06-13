const fs = require('fs');
const path = require('path');
const request = require('request-promise');

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
                    description: 'e.g. "WORKBENCH:"',
                    type: 'text',
                    default: 'WORKBENCH:',
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
        if (!fs.existsSync(path.join(global.CACHE_DIR, 'UnADF.lha'))) {
            Logger.debug('Downloading UnADF from http://aminet.net/disk/misc/UnADF.lha');
            const response = await request({
                uri: 'http://aminet.net/disk/misc/UnADF.lha',
                resolveWithFullResponse: true,
                encoding: null,
            }).catch((err) => {
                throw new Error(err);
            });
            fs.writeFileSync(path.join(global.CACHE_DIR, 'UnADF.lha'), response.body);
        } else {
            Logger.debug('Using cached version of UnADF');
        }
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
