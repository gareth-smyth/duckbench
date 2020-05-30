const fs = require('fs');
const path = require('path');

class EnvironmentSetup {
    constructor(duckbenchConfig) {
        this.duckbenchConfig = duckbenchConfig;
        this.disks = {};

        const executionNumber = (new Date()).toISOString().replace(/[^0-9]/g, '');
        this.executionFolder = path.join('execution', executionNumber);

        if (!fs.existsSync(path.join('./', 'execution'))) {
            fs.mkdirSync(path.join('./', 'execution'));
        }

        fs.mkdirSync(this.executionFolder);
    }

    setRom(rom) {
        this.rom = rom;
    }

    setCPU(cpu) {
        this.cpu = cpu;
    }

    setChipMem(chipMem) {
        this.chipMem = chipMem;
    }

    insertDisk(drive, diskDefinition) {
        let location;
        if ('amigaos'.localeCompare(diskDefinition.type, undefined, {sensitivity: 'accent'}) === 0) {
            const startLocation = path.join(this.duckbenchConfig.osFolder, diskDefinition.name);
            location = path.join(this.executionFolder, drive.replace(':', '.adf'));
            fs.copyFileSync(startLocation, location);
            fs.chmodSync(location, 0o0666);
        } else {
            location = diskDefinition.location;
            fs.chmodSync(location, 0o0666);
        }

        this.disks.ADF ? this.disks.ADF.push({drive, location}) : this.disks.ADF = [{drive, location}];
    }

    attachHDF(drive, location) {
        this.disks.HDF ? this.disks.HDF.push({drive, location}) : this.disks.HDF = [{drive, location}];
    }

    mapFolderToDrive(drive, location, name) {
        this.disks.MAPPED_DRIVE ?
            this.disks.MAPPED_DRIVE.push({drive, location, name}) :
            this.disks.MAPPED_DRIVE = [{drive, location, name}];
    }

    destroy() {
        fs.rmdirSync(this.executionFolder, {recursive: true});
    }
}

module.exports = EnvironmentSetup;
