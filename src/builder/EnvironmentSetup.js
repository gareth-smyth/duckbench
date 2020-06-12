const fs = require('fs');
const path = require('path');

// UnADF requires 300 to run
const RomFileMappings = {
    '2.05': {
        'a600': 'amiga-os-310-a600.rom',
    },
    '3.0': {
        'a1200': 'amiga-os-310-a1200.rom',
    },
    '3.1': {
        'a600': 'amiga-os-310-a600.rom',
        'a1200': 'amiga-os-310-a1200.rom',
        'cd32': 'amiga-os-310-cd32.rom',
    },
};

const WorkbenchDiskMappings = {
    '2.05': 'amiga-os-210-workbench.adf',
    '3.0': 'amiga-os-300-workbench.adf',
    '3.1': 'amiga-os-310-workbench.adf',
};

class EnvironmentSetup {
    constructor(duckbenchConfig) {
        this.duckbenchConfig = duckbenchConfig;
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

    getRomFileName() {
        return RomFileMappings[this.rom][this.systemName];
    }

    getWorkbenchDiskFileName() {
        return WorkbenchDiskMappings[this.rom];
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
