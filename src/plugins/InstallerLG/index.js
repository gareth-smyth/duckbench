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
                    description: 'e.g. "WORKBENCH:c/"',
                    type: 'text',
                    default: 'WORKBENCH:C/',
                },
            },
        };
    }

    async install(config, communicator) {
        if (!this.installed[config.optionValues.location]) {
            await communicator.copy('DB_TOOLS:Installer68k', config.optionValues.location);
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing InstallerLG as it has already been installed to ${config.optionValues.location}`);
        }
    }

    async run(installScript, installOptions, communicator, commandCallback, expectedResponse) {
        await communicator.run(`Installer68k ${installScript}`, installOptions, commandCallback, expectedResponse);
    }
}

module.exports = InstallerLG;
