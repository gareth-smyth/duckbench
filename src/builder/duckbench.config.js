/* istanbul ignore file - ignore config file */
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

module.exports = config;
