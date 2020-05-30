/* istanbul ignore file - ignore config file */
const path = require('path');

let config;

Logger.trace('Trying Amiga Forever paths');
if (process.env.DUCKBENCH_ROMS && process.env.DUCKBENCH_DISKS && process.env.DUCKBENCH_EMU) {
    Logger.trace('Found paths...  setting config');
    config = {
        romFolder: process.env.DUCKBENCH_ROMS,
        osFolder: process.env.DUCKBENCH_DISKS,
        emuRoot: process.env.DUCKBENCH_EMU,
    };
} else if (process.env.AMIGAFOREVERDATA && process.env.AMIGAFOREVERROOT) {
    Logger.trace('Found Amiga Forever paths...  setting config');
    config = {
        romFolder: path.join(process.env.AMIGAFOREVERDATA, 'Shared', 'rom'),
        osFolder: path.join(process.env.AMIGAFOREVERDATA, 'Shared', 'adf'),
        emuRoot: path.join(process.env.AMIGAFOREVERROOT, 'winUAE'),
    };
} else {
    throw new Error(`Cannot find required paths. Either AMIGAFOREVERDATA and AMIGAFOREVERROOT should be set, or DUCKBENCH_ROMS, DUCKBENCH_DISKS, and DUCKBENCH_EMU.
    AMIGAFOREVERDATA: "${process.env.AMIGAFOREVERDATA}",
    AMIGAFOREVERROOT: "${process.env.AMIGAFOREVERROOT}",
    DUCKBENCH_ROMS: "${process.env.DUCKBENCH_ROMS}",
    DUCKBENCH_DISKS: "${process.env.DUCKBENCH_DISKS}",
    DUCKBENCH_EMU: "${process.env.DUCKBENCH_EMU}"`);
}

module.exports = config;
