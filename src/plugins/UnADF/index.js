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
        if (!fs.existsSync(path.join(global.TOOLS_DIR, 'UnADF.lha'))) {
            Logger.debug('Downloading UnADF from http://aminet.net/disk/misc/UnADF.lha');
            const response = await request({
                uri: 'http://aminet.net/disk/misc/UnADF.lha',
                resolveWithFullResponse: true,
                encoding: null,
            }).catch((err) => {
                throw new Error(err);
            });
            fs.writeFileSync(path.join(global.TOOLS_DIR, 'UnADF.lha'), response.body);
        } else {
            Logger.debug('Using cached version of UnADF');
        }
    }

    async install(config, communicator) {
        if (!Object.keys(this.installed).length) {
            Logger.debug('Extracting unadf to duckbench:');
            await communicator.sendCommand(`lha_68k x DB_TOOLS:UnADF.lha ${config.optionValues.location}`).then((response) => {
                if (response.length === 0 || !response.join().includes('Operation successful.')) {
                    throw new Error(`Expected "Operation successful." when installing unadf but got "${response}"`);
                }
                Logger.debug('extracted unadf to duckbench:');
                this.installed[config.optionValues.location] = true;
            }).catch((err) => {
                throw new Error(err);
            });
        } else {
            Logger.trace('Not extracting unadf as it has already been extracted to duckbench:');
        }
    }

    async run(sourceLocation, sourceFile, destination, unADFLocation, communicator) {
        await communicator.sendCommand(`copy ${sourceLocation}${sourceFile} duckbench:`).then((response) => {
            if (response.length > 0) {
                throw new Error(`Expected no response when copying ${sourceLocation}${sourceFile} to temporary location duckbench: but got "${response}"`);
            }
            Logger.debug(`Copied ${sourceLocation}${sourceFile} temporarily to duckbench:`);
        }).catch((err) => {
            throw new Error(err);
        });

        await communicator.sendCommand(`cd ${unADFLocation}UnADF`).then((response) => {
            if (response.length > 0) {
                throw new Error(`Expected no response when changing directory to ${unADFLocation}UnADF but got "${response}"`);
            }
            Logger.debug(`Changed directory to ${unADFLocation}UnADF`);
        }).catch((err) => {
            throw new Error(err);
        });

        await communicator.sendCommand(`unadf duckbench:${sourceFile} DEST=${destination}`).then((response) => {
            if (response.length === 0 || !RegExp(/Saved \d* file/).test(response.join())) {
                throw new Error(`Expected "Saved XX files" when calling "duckbench:${sourceFile} DEST=${destination}" but got "${response}"`);
            }
            Logger.debug(`Extracted ${sourceLocation}${sourceFile} to ${destination}`);
        }).catch((err) => {
            throw new Error(err);
        });

        await communicator.sendCommand(`delete duckbench:${sourceFile}`).then((response) => {
            if (response.length === 0 || response.join() !== `duckbench:${sourceFile}  Deleted`) {
                throw new Error(`Expected "duckbench:${sourceFile}  Deleted" when deleting "${sourceFile}" from temporary location duckbench: but got "${response}"`);
            }
            Logger.debug(`Deleted ${sourceFile} from temporary location in duckbench:`);
        }).catch((err) => {
            throw new Error(err);
        });
    }
}

module.exports = UnADF;
