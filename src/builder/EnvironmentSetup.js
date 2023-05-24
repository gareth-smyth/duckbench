const fs = require('fs');
const path = require('path');

class EnvironmentSetup {
    constructor() {
        this.disks = {};

        const executionNumber = (new Date()).toISOString().replace(/[^0-9]/g, '');
        this.executionFolder = path.join(global.BASE_DIR, 'execution', executionNumber);

        if (!fs.existsSync(path.join(global.BASE_DIR, 'execution'))) {
            fs.mkdirSync(path.join(global.BASE_DIR, 'execution'));
        }

        fs.mkdirSync(this.executionFolder);
    }

    setSystemName(systemName) {
        this.systemName = systemName;
    }

    setRom(rom) {
        this.rom = rom;
    }

    setCPU(cpu) {
        this.cpu = cpu;
    }

    // UnADF requires an 020
    getCPU() {
        return Math.max(Number(this.cpu), 68020).toString();
    }

    setChipMem(chipMem) {
        this.chipMem = chipMem;
    }

    setFastMem(fastMem) {
        this.fastMem = fastMem;
    }

    setFloppyDrive(floppyDrive) {
        this.floppyDrive = floppyDrive;
    }

    insertCDISO(location) {
        this.disks.CD ? this.disks.CD.push({location}) : this.disks.CD = [{location}];
    }

    insertDisk(drive, diskDefinition) {
        const startLocation = diskDefinition.location;
        const location = path.join(this.executionFolder, drive + '.adf');
        fs.copyFileSync(startLocation, location);
        fs.chmodSync(location, 0o0666);

        this.disks.ADF ? this.disks.ADF.push({drive, location}) : this.disks.ADF = [{drive, location}];
    }

    attachHDF(drive, location) {
        this.disks.HDF ? this.disks.HDF.push({drive, location}) : this.disks.HDF = [{drive, location}];
    }

    mapFolderToDrive(drive, location, name, writeable = false) {
        this.disks.MAPPED_DRIVE ?
            this.disks.MAPPED_DRIVE.push({drive, location, name, writeable}) :
            this.disks.MAPPED_DRIVE = [{drive, location, name, writeable}];
    }

    destroy() {
        fs.rmSync(this.executionFolder, {recursive: true, force: true});
    }
}

module.exports = EnvironmentSetup;
