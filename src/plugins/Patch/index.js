const fs = require('fs');
const request = require('request-promise');

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
        if (!fs.existsSync('./external_tools/patch-2.1.lha')) {
            Logger.debug('Downloading patch from http://aminet.net/dev/misc/patch-2.1.lha');
            const response = await request({
                uri: 'http://aminet.net/dev/misc/patch-2.1.lha',
                resolveWithFullResponse: true,
                encoding: null,
            }).catch((err) => {
                throw new Error(err);
            });
            fs.writeFileSync('./external_tools/patch-2.1.lha', response.body);
        } else {
            Logger.debug('Using cached version of patch');
        }
    }

    async install(config, communicator) {
        await this.extractPatch(config, communicator);
        await this.installPatch(config, communicator);
    }

    async installPatch(config, communicator) {
        if (!this.installed[config.optionValues.location]) {
            Logger.debug(`Installing patch to ${config.optionValues.location}`);
            await communicator.sendCommand(`copy duckbench:patch-2.1/c/patch ${config.optionValues.location}`).then((response) => {
                if (response.length > 0) {
                    throw new Error(`Expected no response when installing patch but got "${response}"`);
                }
                Logger.debug(`Installed patch to ${config.optionValues.location}`);
                this.installed[config.optionValues.location] = true;
            }).catch((err) => {
                throw new Error(err);
            });
        } else {
            Logger.trace(`Not installing patch as it has already been installed to ${config.optionValues.location}`);
        }
    }

    async extractPatch(config, communicator) {
        if (!Object.keys(this.installed).length) {
            Logger.debug('Extracting patch to duckbench:');
            await communicator.sendCommand('lha_68k x DB_TOOLS:Patch-2.1.lha duckbench:').then((response) => {
                if (response.length === 0 || !response.join().includes('Operation successful.')) {
                    throw new Error(`Expected "Operation successful." when installing patch but got "${response}"`);
                }
                Logger.debug('extracted patch to duckbench:');
            }).catch((err) => {
                throw new Error(err);
            });
        } else {
            Logger.trace('Not extracting patch as it has already been extracted to duckbench:');
        }
    }
}

module.exports = Patch;
