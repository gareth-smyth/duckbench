const fs = require('fs');
const path = require('path');
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
        if (!fs.existsSync(path.join(global.TOOLS_DIR, 'patch-2.1.lha'))) {
            Logger.debug('Downloading patch from http://aminet.net/dev/misc/patch-2.1.lha');
            const response = await request({
                uri: 'http://aminet.net/dev/misc/patch-2.1.lha',
                resolveWithFullResponse: true,
                encoding: null,
            }).catch((err) => {
                throw new Error(err);
            });
            fs.writeFileSync(path.join(global.TOOLS_DIR, 'patch-2.1.lha'), response.body);
        } else {
            Logger.debug('Using cached version of patch');
        }
    }

    async install(config, communicator, pluginStore) {
        if (!this.installed[config.optionValues.location]) {
            const lha = pluginStore.getPlugin('Lha');
            await lha.run('DB_TOOLS:patch-2.1.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
            await communicator.copy('duckbench:patch-2.1/c/patch', config.optionValues.location);
            await communicator.delete('duckbench:patch-2.1', {ALL: true});
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing patch as it has already been installed to ${config.optionValues.location}`);
        }
    }

    async run(target, patchFile, patchLocation, patchOptions, communicator,
              commandCallback, expectedResponse = ['succeeded', 'done']) {
        await communicator.run(`${patchLocation}patch ${target} ${patchFile}`, patchOptions, commandCallback, expectedResponse);
    }
}

module.exports = Patch;
