/* istanbul ignore file - ignore config file */
const path = require('path');

let config;

Logger.trace('Looking for ROMs');
if (process.env.DUCKBENCH_ROMS) {
    Logger.trace('Found rom paths using environment vars... setting config');
    config = {
        romFolder: process.env.DUCKBENCH_ROMS,
    };
} else if (process.env.AMIGAFOREVERDATA) {
    Logger.trace('Found rom paths using Amiga Forever environment vars... setting config');
    config = {
        romFolder: path.join(process.env.AMIGAFOREVERDATA, 'Shared', 'rom'),
    };
} else {
    throw new Error('Cannot find required paths. Either AMIGAFOREVERDATA should be set, ' +
        `or DUCKBENCH_ROMS.
    AMIGAFOREVERDATA: "${process.env.AMIGAFOREVERDATA}",
    DUCKBENCH_ROMS: "${process.env.DUCKBENCH_ROMS}"`);
}

module.exports = config;
