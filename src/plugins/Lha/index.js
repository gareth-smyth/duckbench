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
            Logger.debug(`Installing LHA to ${config.optionValues.location}`);
            await communicator.sendCommand(`DB_TOOLS:lha.run -x ${config.optionValues.location}`).then((response) => {
                if (response.length === 0 || !response.join().includes('Extracting: lha_68k')) {
                    throw new Error(`Expected response to include "Extracting: lha_68k" when installing LHA but got "${response}"`);
                }
                Logger.debug(`Installed LHA to ${config.optionValues.location}`);
                this.installed[config.optionValues.location] = true;
            }).catch((err) => {
                throw new Error(err);
            });
        } else {
            Logger.trace(`Not installing LHA as it has already been installed to ${config.optionValues.location}`);
        }
    }
}

module.exports = Lha;
