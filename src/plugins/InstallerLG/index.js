class InstallerLG {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'InstallerLG',
            label: 'Installer LG',
            description: 'Installs installer LG into the specified drive for use by applications.',
            options: {
                location: {
                    name: 'location',
                    label: 'Install to',
                    description: 'e.g. "NEW_WORKBENCH:c/"',
                    type: 'text',
                    default: 'NEW_WORKBENCH:C/',
                },
            },
        };
    }

    async install(config, communicator) {
        if (!this.installed[config.optionValues.location]) {
            await communicator.copy('DB_TOOLS:InstallerLG', config.optionValues.location);
            this.installed[config.optionValues.location] = true;
        } else {
            const location = config.optionValues.location;
            Logger.trace(`Not installing InstallerLG as it has already been installed to ${location}`);
        }
    }

    async run(installScript, installOptions, communicator, commandCallback, expectedResponse) {
        await communicator.run(`InstallerLG ${installScript}`, installOptions, commandCallback, expectedResponse);
    }
}

module.exports = InstallerLG;
