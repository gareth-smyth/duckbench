const fs = require('fs');
const path = require('path');

const RomFinderService = require('../../services/RomFinderService');

class Settings {
    get() {
        return {
            name: 'Setup',
            label: 'Setup',
            settings: [{
                name: 'emulatorRoot',
                type: 'hostFolder',
                label: 'Emulator root',
                hasDefaultSearch: true,
            }, {
                name: 'rom310',
                type: 'hostFile',
                label: 'Kickstart 3.1',
                hasDefaultSearch: true,
            }],
        };
    }

    default(settingName) {
        switch (settingName) {
        case 'emulatorRoot':
            return this.findEmulator();
        case 'rom310':
            return this.findRom310();
        }
    }

    findEmulator() {
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
            return {};
        }
    }

    findRom310() {
        Logger.trace('Looking for ROMs');
        if (process.env.DUCKBENCH_ROMS) {
            Logger.trace('Found rom paths using environment vars... setting config');
            return RomFinderService.find('3.1', process.env.DUCKBENCH_ROMS);
        } else if (process.env.AMIGAFOREVERDATA) {
            Logger.trace('Found rom paths using Amiga Forever environment vars... setting config');
            return RomFinderService.find('3.1', path.join(process.env.AMIGAFOREVERDATA, 'Shared', 'rom'));
        } else {
            Logger.trace('Cannot find required paths. Either AMIGAFOREVERDATA should be set, ' +
                `or DUCKBENCH_ROMS.
    AMIGAFOREVERDATA: "${process.env.AMIGAFOREVERDATA}",
    DUCKBENCH_ROMS: "${process.env.DUCKBENCH_ROMS}"`);
            return {};
        }
    }
}

module.exports = Settings;
