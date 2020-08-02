const fs = require('fs');

class Settings {
    get() {
        return {
            name: 'Setup',
            settings: [{
                name: 'emulatorRoot',
                type: 'hostFolder',
                label: 'Emulator root',
            }],
        };
    }

    default(settingName) {
        switch (settingName) {
        case 'emulatorRoot':
            Logger.trace('Looking for an emulator');
            if (process.env.DUCKBENCH_EMU) {
                Logger.trace('Found an emulator path using environment vars.');
                return {folder: process.env.DUCKBENCH_EMU};
            } else if (fs.existsSync('C:/Program Files/WinUAE')) {
                Logger.trace('Found WinUAE paths at "C:/Program Files/WinUAE".');
                return {folder: 'C:/Program Files/WinUAE'};
            } else if (fs.existsSync('C:/Program Files (x86)/WinUAE')) {
                Logger.trace('Found WinUAE paths at "C:/Program Files (x86)/WinUAE".');
                return {folder: 'C:/Program Files (x86)/WinUAE'};
            } else {
                return undefined;
            }
        }
    }
}

module.exports = Settings;
