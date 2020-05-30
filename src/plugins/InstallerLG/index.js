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

    async install(config, emu) {
        if (!this.installed[config.optionValues.location]) {
            Logger.debug(`Installing InstallerLG to ${config.optionValues.location}`);
            await emu.sendCommand(`copy DB_TOOLS:Installer68k ${config.optionValues.location}`).then((response) => {
                if (response.length > 0) {
                    throw new Error(`Expected no response when installing Installer68k but got "${response}"`);
                }
                Logger.debug(`Installed InstallerLG to ${config.optionValues.location}`);
                this.installed[config.optionValues.location] = true;
            }).catch((err) => {
                throw new Error(err);
            });
        } else {
            Logger.trace(`Not installing InstallerLG as it has already been installed to ${config.optionValues.location}`);
        }
    }
}

module.exports = InstallerLG;
