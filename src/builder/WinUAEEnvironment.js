const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

class WinUAEEnvironment {
    constructor(config, environment) {
        this.config = config;

        this.uaeRunningConfig = path.join(environment.executionFolder, 'amiga.uae');
        const configFile = fs.openSync(this.uaeRunningConfig, 'w');

        fs.writeSync(configFile, 'use_gui=no\n');
        fs.writeSync(configFile, '// headless=true\n');
        fs.writeSync(configFile, 'use_debugger=true\n');
        fs.writeSync(configFile, 'win32.serial_port=TCP://0.0.0.0:1234\n');
        fs.writeSync(configFile, 'serial_direct=true\n');
        fs.writeSync(configFile, 'serial_translate=disabled\n');

        fs.writeSync(configFile, `kickstart_rom_file=${path.join(config.romFolder, environment.getRomFileName())}\n`);
        fs.writeSync(configFile, `rom_path=${config.romFolder}\n`);
        fs.writeSync(configFile, `cpu_type=${environment.getCPU()}\n`);

        fs.writeSync(configFile, `chipmem_size=${Number(environment.chipMem) * 2}\n`);
        fs.writeSync(configFile, `z3mem_size=${environment.fastMem}\n`);
        fs.writeSync(configFile, 'floppy_speed=800\n');

        this.writeDiskConfig(configFile, environment.disks);

        fs.closeSync(configFile);
    }

    writeDiskConfig(configFile, disks) {
        if (disks.ADF) {
            disks.ADF.forEach((disk) => {
                const diskNum = disk.drive[2];
                fs.writeSync(configFile, `floppy${diskNum}=${disk.location}\n`);
            });
        }

        let diskIdx = 0;
        if (disks.HDF) {
            disks.HDF.forEach((disk) => {
                const hardfileLine = `hardfile2=rw,${disk.drive}:${disk.location},0,0,0,512,0,,uae${diskIdx}\n`;
                const hfLine = `uaehf${diskIdx}=hdf,rw,${disk.drive}:${disk.location},0,0,0,512,0,,uae${diskIdx}\n`;
                fs.writeSync(configFile, hardfileLine);
                fs.writeSync(configFile, hfLine);
                diskIdx += 1;
            });
        }

        if (disks.MAPPED_DRIVE) {
            disks.MAPPED_DRIVE.forEach((disk) => {
                fs.writeSync(configFile, `filesystem2=ro,${disk.drive}:${disk.name}:${disk.location},-128\n`);
                fs.writeSync(configFile, `uaehf${diskIdx}=dir,ro,${disk.drive}:${disk.name}:${disk.location},-128\n`);
                diskIdx += 1;
            });
        }
    }

    stop() {
        this.winuaeProcess.kill();
    }

    start() {
        const path32 = path.join(this.config.emuRoot, 'WinUAE.exe');
        const path64 = path.join(this.config.emuRoot, 'WinUAE64.exe');
        const executablePath = fs.existsSync(path32) ? path32 : path64;
        this.winuaeProcess = spawn(executablePath,
            ['-f', path.join(this.uaeRunningConfig)],
        );
    }
}

module.exports = WinUAEEnvironment;
