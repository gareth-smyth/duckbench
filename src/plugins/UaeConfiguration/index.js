const fs = require('fs');
const path = require('path');

class UAEConfiguration {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'UAEConfiguration',
            label: 'UAE Configuration',
            description: 'Allows configuration changes to be made to the running UAE instance.',
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

    async install(config) {
        if (!this.installed[config.optionValues.location]) {
            const configurationPath = path.join(config.emuRoot, 'Amiga Programs', 'uae-configuration');
            fs.copySync(configurationPath, config.executionFolder);
        } else {
            Logger.trace(`Not installing uae-configuration - it has been installed to ${config.optionValues.location}`);
        }
    }
}

module.exports = UAEConfiguration;
