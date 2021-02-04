const fs = require('fs');
const path = require('path');

class WinUAETools {
    constructor() {
        this.installed = {};
    }

    structure() {
        return {
            name: 'WinUAETools',
            label: 'UAE Tools',
            description: 'Allows configuration changes to be made to the running UAE ' +
                'instance and control of the emulator.',
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

    configure() {
        return [{
            name: 'RedirectInputFile',
        }];
    }

    async install(config, communicator, pluginStore, environmentSetup, settings) {
        if (!this.installed[config.optionValues.location]) {
            Logger.trace(`Installing win uae tools to ${config.optionValues.location}`);
            if (!fs.existsSync(path.join(global.CACHE_DIR, 'uae-configuration')) ||
                !fs.existsSync(path.join(global.CACHE_DIR, 'uaectrl'))) {
                Logger.trace('Installing win uae tools to cache');

                const emuRoot = settings['Setup'].find((setting) => setting.name === 'emulatorRoot');
                const configurationPath = path.join(emuRoot.value.folder, 'Amiga Programs', 'uae-configuration');
                const ctrlPath = path.join(emuRoot.value.folder, 'Amiga Programs', 'uaectrl');

                fs.copyFileSync(configurationPath, path.join(global.CACHE_DIR, 'uae-configuration'));
                fs.copyFileSync(ctrlPath, path.join(global.CACHE_DIR, 'uaectrl'));
            } else {
                Logger.trace('Not installing win uae tools to cache - they have already been installed');
            }
            await communicator.copy('DB_HOST_CACHE:uae-configuration', `${config.optionValues.location}`);
            await communicator.copy('DB_HOST_CACHE:uaectrl', `${config.optionValues.location}`);
            this.installed[config.optionValues.location] = true;
        } else {
            Logger.trace(`Not installing win uae tools - they have been installed to ${config.optionValues.location}`);
        }
    }

    async ejectFloppy(uaeConfigLocation, driveNumber, communicator, pluginStore) {
        const redirectInputFile = await pluginStore.getPlugin('RedirectInputFile');
        const inputOptions = await redirectInputFile.createInput(['8', driveNumber, '10'], communicator);
        const commandString = `${uaeConfigLocation}uaectrl`;
        await communicator.run(commandString, {REDIRECT_IN: inputOptions}, undefined, '10) Exit UAE-Control');
    }

    async restart(uaeConfigLocation, communicator, pluginStore) {
        const redirectInputFile = await pluginStore.getPlugin('RedirectInputFile');
        const inputOptions = await redirectInputFile.createInput(['1'], communicator);
        const commandString = `${uaeConfigLocation}uaectrl`;
        await communicator.run(commandString, {REDIRECT_IN: inputOptions}, undefined, '10) Exit UAE-Control');
    }
}

module.exports = WinUAETools;
