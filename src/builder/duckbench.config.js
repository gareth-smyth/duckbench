/* istanbul ignore file - ignore config file */
const fs = require('fs');
const path = require('path');

let config;

Logger.trace('Looking for ROMs and disks');
if (process.env.DUCKBENCH_ROMS && process.env.DUCKBENCH_DISKS) {
    Logger.trace('Found rom and disk paths using environment vars... setting config');
    config = {
        romFolder: process.env.DUCKBENCH_ROMS,
        osFolder: process.env.DUCKBENCH_DISKS,
    };
} else if (process.env.AMIGAFOREVERDATA) {
    Logger.trace('Found rom and disk paths using Amiga Forever environment vars... setting config');
    config = {
        romFolder: path.join(process.env.AMIGAFOREVERDATA, 'Shared', 'rom'),
        osFolder: path.join(process.env.AMIGAFOREVERDATA, 'Shared', 'adf'),
    };
} else {
    throw new Error('Cannot find required paths. Either AMIGAFOREVERDATA should be set, ' +
        `or DUCKBENCH_ROMS and DUCKBENCH_DISKS.
    AMIGAFOREVERDATA: "${process.env.AMIGAFOREVERDATA}",
    DUCKBENCH_ROMS: "${process.env.DUCKBENCH_ROMS}",
    DUCKBENCH_DISKS: "${process.env.DUCKBENCH_DISKS}"`);
}

Logger.trace('Looking for WinUAE');
if (process.env.DUCKBENCH_EMU) {
    Logger.trace('Found WinUAE path using environment vars... setting config');
    config.emuRoot = process.env.DUCKBENCH_EMU;
} else if (fs.existsSync('C:/Program Files/WinUAE')) {
    Logger.trace('Found WinUAE paths at "C:/Program Files/WinUAE"... setting config');
    config.emuRoot = 'C:/Program Files/WinUAE';
} else if (fs.existsSync('C:/Program Files (x86)/WinUAE')) {
    Logger.trace('Found WinUAE paths at "C:/Program Files (x86)/WinUAE"... setting config');
    config.emuRoot = 'C:/Program Files (x86)/WinUAE';
} else {
    throw new Error('Cannot find required paths. Either DUCKBENCH_EMU should be set, ' +
        `or WinUAE should be installed in "c:/program files" or "c:/program files (x86)".
    DUCKBENCH_EMU: "${process.env.DUCKBENCH_EMU}"`);
}

module.exports = config;
