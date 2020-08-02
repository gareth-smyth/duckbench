const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');

const WinUAEEnvironment = require('../../src/builder/WinUAEEnvironment');

jest.mock('child_process');
jest.mock('fs');

it('spawns a new winuae 32 bit process', () => {
    const environment = new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'some/place'},
        {executionFolder: '/some/folder', disks: {}, rom: 'a_rom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020'},
    );
    fs.existsSync = jest.fn().mockReturnValue(true);
    environment.start();
    const configFileLocation = path.join('/some/folder/', 'amiga.uae');
    expect(spawn).toHaveBeenCalledWith(path.join('/path/to/winuae/', 'WinUAE.exe'), ['-f', configFileLocation]);
});

it('spawns a new winuae 64 bit process', () => {
    const environment = new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'some/place'},
        {executionFolder: '/some/folder', disks: {}, rom: 'a_rom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020'},
    );
    fs.existsSync = jest.fn().mockReturnValue(false);
    environment.start();
    const configFileLocation = path.join('/some/folder/', 'amiga.uae');
    expect(spawn).toHaveBeenCalledWith(path.join('/path/to/winuae/', 'WinUAE64.exe'), ['-f', configFileLocation]);
});

it('kills the winuae process', () => {
    const environment = new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'some/place'},
        {executionFolder: '/some/folder', disks: {}, rom: 'a_rom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020'},
    );
    const process = {kill: jest.fn()};
    spawn.mockReturnValueOnce(process);
    environment.start();
    environment.stop();
    expect(process.kill).toHaveBeenCalledTimes(1);
});

it('does not kill the winuae process when it does not exist', () => {
    const environment = new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'some/place'},
        {executionFolder: '/some/folder', disks: {}, rom: 'a_rom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020'},
    );
    spawn.mockReturnValueOnce(undefined);
    environment.start();
    environment.stop();
});

it('writes the non-configurable parts of the config', () => {
    const someFile = 'someFile';
    fs.openSync.mockReturnValueOnce(someFile);
    new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'some/place'},
        {executionFolder: '/some/folder', disks: {}, rom: 'a_rom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020'},
    );
    expect(fs.openSync).toHaveBeenCalledWith(path.join('/some/folder/', 'amiga.uae'), 'w');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'use_gui=no\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, '// headless=true\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'use_debugger=true\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'win32.serial_port=TCP://0.0.0.0:1234\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'serial_direct=true\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'serial_translate=disabled\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'floppy_speed=0\n');
});

it('writes the non-disk or cpu related parts of the config', () => {
    const someFile = 'someFile';
    fs.openSync.mockReturnValueOnce(someFile);
    new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'path/to/rom/folder'},
        {
            executionFolder: '/some/folder', disks: {}, rom: 'arom', cpu: '68000',
            chipMem: '4', fastMem: 'someMem',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020',
        },
    );
    expect(fs.openSync).toHaveBeenCalledWith(path.join('/some/folder/', 'amiga.uae'), 'w');
    const expectedRomPath = `${path.join('path/to/rom/folder/', 'aRomFile')}`;
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, `kickstart_rom_file=${expectedRomPath}\n`);
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'chipmem_size=8\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'z3mem_size=someMem\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'rom_path=path/to/rom/folder\n');
});

it('writes the cpu related parts of the config for a non-68030', () => {
    const someFile = 'someFile';
    fs.openSync.mockReturnValueOnce(someFile);
    new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'path/to/rom/folder'},
        {
            executionFolder: '/some/folder', disks: {}, rom: 'arom', cpu: '68000',
            chipMem: '4', fastMem: 'someMem',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020',
        },
    );
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'cpu_type=68020\n');
});

it('writes the cpu related parts of the config for a 68030', () => {
    const someFile = 'someFile';
    fs.openSync.mockReturnValueOnce(someFile);
    new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'path/to/rom/folder'},
        {
            executionFolder: '/some/folder', disks: {}, rom: 'arom', cpu: '68000',
            chipMem: '4', fastMem: 'someMem',
            getRomFileName: () => 'aRomFile', getCPU: () => '68030',
        },
    );
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'cpu_type=68020\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'cpu_model=68030\n');
});

it('writes the floppy related parts of the config', () => {
    const someFile = 'someFile';
    fs.openSync.mockReturnValueOnce(someFile);
    new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'path/to/rom/folder'},
        {
            executionFolder: '/some/folder',
            disks: {
                ADF: [
                    {drive: 'df0:', location: 'some/disk.adf'}, {drive: 'df2:', location: 'some/disk2.adf'},
                ],
            },
            rom: 'arom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020',
        },
    );
    expect(fs.openSync).toHaveBeenCalledWith(path.join('/some/folder/', 'amiga.uae'), 'w');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'floppy0=some/disk.adf\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'floppy2=some/disk2.adf\n');
});

it('writes the CD related parts of the config', () => {
    const someFile = 'someFile';
    fs.openSync.mockReturnValueOnce(someFile);
    new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'path/to/rom/folder'},
        {
            executionFolder: '/some/folder',
            disks: {CD: [{location: 'some/disk.file'}, {location: 'some/disk2.iso'}]},
            rom: 'arom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020',
        },
    );
    expect(fs.openSync).toHaveBeenCalledWith(path.join('/some/folder/', 'amiga.uae'), 'w');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'win32.map_cd_drives=true\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'cdimage0=some/disk.file\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'cdimage1=some/disk2.iso\n');
});

it('writes the uaehf related parts of the config', () => {
    const someFile = 'someFile';
    fs.openSync.mockReturnValueOnce(someFile);
    new WinUAEEnvironment(
        {emuRoot: '/path/to/winuae/', romFolder: 'path/to/rom/folder'},
        {
            executionFolder: '/some/folder',
            disks: {
                HDF: [{drive: 'dh0', location: 'some/disk.hdf'}, {drive: 'dh4', location: 'some/disk2.hdf'}],
                MAPPED_DRIVE: [
                    {drive: 'dh3', name: 'drive1', location: 'some/folder', writeable: true},
                    {drive: 'dh2', name: 'drive2', location: 'some/folder2'},
                ],
            },
            rom: 'arom',
            getRomFileName: () => 'aRomFile', getCPU: () => '68020',
        },
    );
    expect(fs.openSync).toHaveBeenCalledWith(path.join('/some/folder/', 'amiga.uae'), 'w');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'hardfile2=rw,dh0:some/disk.hdf,0,0,0,512,0,,uae0\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'uaehf0=hdf,rw,dh0:some/disk.hdf,0,0,0,512,0,,uae0\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'hardfile2=rw,dh4:some/disk2.hdf,0,0,0,512,0,,uae1\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'uaehf1=hdf,rw,dh4:some/disk2.hdf,0,0,0,512,0,,uae1\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'filesystem2=rw,dh3:drive1:some/folder,-128\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'uaehf2=dir,rw,dh3:drive1:some/folder,-128\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'filesystem2=ro,dh2:drive2:some/folder2,-128\n');
    expect(fs.writeSync).toHaveBeenCalledWith(someFile, 'uaehf3=dir,ro,dh2:drive2:some/folder2,-128\n');
});
