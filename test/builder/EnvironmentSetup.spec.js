const {when} = require('jest-when');
const fs = require('fs');
const path = require('path');

const EnvironmentSetup = require('../../src/builder/EnvironmentSetup');

jest.mock('fs');

let RealDate;

beforeEach(() => {
    RealDate = Date;
});

afterEach(() => {
    global.Date = RealDate;
});

it('creates the execution root folder and execution folder if it does not exist', () => {
    when(fs.existsSync).expectCalledWith(path.join(global.BASE_DIR, 'execution')).mockReturnValueOnce(false);

    global.Date = jest.fn(() => new RealDate('2020-04-01T17:29:30.235Z'));

    new EnvironmentSetup({});

    expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(global.BASE_DIR, 'execution'));
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(global.BASE_DIR, 'execution', '20200401172930235'));
});

it('deletes the execution folder when destory is called.', () => {
    when(fs.existsSync).expectCalledWith(path.join(global.BASE_DIR, 'execution')).mockReturnValueOnce(false);

    global.Date = jest.fn(() => new RealDate('2020-04-01T17:29:30.235Z'));

    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.destroy();

    expect(fs.rmdirSync).toHaveBeenCalledTimes(1);
    const executionFolder = path.join(global.BASE_DIR, 'execution', '20200401172930235');
    expect(fs.rmdirSync).toHaveBeenCalledWith(executionFolder, {recursive: true});
});

it('creates only the execution folder if the root folder exists', () => {
    when(fs.existsSync).expectCalledWith(path.join(global.BASE_DIR, 'execution')).mockReturnValueOnce(true);

    global.Date = jest.fn(() => new RealDate('2020-04-01T18:29:30.235Z'));

    new EnvironmentSetup({});

    expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
    expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(global.BASE_DIR, 'execution', '20200401182930235'));
});

it('sets the system name', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setSystemName('Amiga 100-');
    expect(environmentSetup.systemName).toEqual('Amiga 100-');
});

it('sets the rom', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setRom('somerom');
    expect(environmentSetup.rom).toEqual('somerom');
});

it('sets the cpu', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setCPU('68060');
    expect(environmentSetup.cpu).toEqual('68060');
});

it('gets the cpu as 68020 when it is less than 68020', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setCPU('68000');
    expect(environmentSetup.getCPU()).toEqual('68020');
});

it('gets the cpu as-is when it is at least than 68020', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setCPU('68030');
    expect(environmentSetup.getCPU()).toEqual('68030');
});

it('sets the chip ram', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setChipMem('1MB');
    expect(environmentSetup.chipMem).toEqual('1MB');
});

it('sets the fast ram', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setFastMem('4MB');
    expect(environmentSetup.fastMem).toEqual('4MB');
});

it('sets the floppy drive', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.setFloppyDrive(true);
    expect(environmentSetup.floppyDrive).toEqual(true);
});

it('sets the cd drive', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.insertCDISO('/my/location');
    environmentSetup.insertCDISO('/my/other/location');
    expect(environmentSetup.disks.CD[0]).toEqual({location: '/my/location'});
    expect(environmentSetup.disks.CD[1]).toEqual({location: '/my/other/location'});
});

it('adds HDFs', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.attachHDF('dh0:', '/home/drive1');
    environmentSetup.attachHDF('dh3:', '/home/drive2');
    expect(environmentSetup.disks.HDF[0]).toEqual({drive: 'dh0:', location: '/home/drive1'});
    expect(environmentSetup.disks.HDF[1]).toEqual({drive: 'dh3:', location: '/home/drive2'});
});

it('maps folders to drives', () => {
    const environmentSetup = new EnvironmentSetup({});
    environmentSetup.mapFolderToDrive('dh0:', '/home/drive1', 'driveA');
    environmentSetup.mapFolderToDrive('dh3:', '/home/drive2', 'driveB', true);
    expect(environmentSetup.disks.MAPPED_DRIVE[0])
        .toEqual({drive: 'dh0:', location: '/home/drive1', name: 'driveA', writeable: false});
    expect(environmentSetup.disks.MAPPED_DRIVE[1])
        .toEqual({drive: 'dh3:', location: '/home/drive2', name: 'driveB', writeable: true});
});

it('inserts amiga and non-amiga os ADFs', () => {
    global.Date = jest.fn(() => new RealDate('2020-04-01T20:29:30.235Z'));
    const environmentSetup = new EnvironmentSetup({osFolder: '/home/osdisks/'});

    environmentSetup.insertDisk('df0', {location: '/home/disk1.adf'});
    environmentSetup.insertDisk('df1', {type: 'amigaos', name: 'amiga-os-310-workbench.adf'});
    environmentSetup.insertDisk('df5', {location: '/home/disk2.adf'});
    const bootDiskLocation = path.join(global.BASE_DIR, 'execution', '20200401202930235', 'df0.adf');
    expect(environmentSetup.disks.ADF[0]).toEqual({drive: 'df0', location: bootDiskLocation});
    const wbDiskLocation = path.join(global.BASE_DIR, 'execution', '20200401202930235', 'df1.adf');
    expect(environmentSetup.disks.ADF[1]).toEqual({drive: 'df1', location: wbDiskLocation});
    const otherDiskLocation = path.join(global.BASE_DIR, 'execution', '20200401202930235', 'df5.adf');
    expect(environmentSetup.disks.ADF[2]).toEqual({drive: 'df5', location: otherDiskLocation});
});

it('sets disk permissions for non amiga os disks', () => {
    global.Date = jest.fn(() => new RealDate('2020-04-01T20:29:30.235Z'));
    const environmentSetup = new EnvironmentSetup({osFolder: '/home/osdisks/'});

    environmentSetup.insertDisk('df0', {location: '/home/disk1.adf'});
    expect(fs.chmodSync).toHaveBeenCalledTimes(1);
    const diskLocation = path.join(global.BASE_DIR, 'execution', '20200401202930235', 'df0.adf');
    expect(fs.chmodSync).toHaveBeenCalledWith(diskLocation, 0o0666);
});

it('copies disks and sets permissions', () => {
    global.Date = jest.fn(() => new RealDate('2020-04-01T20:29:30.235Z'));
    const environmentSetup = new EnvironmentSetup({});
    const wbSourceLocation = '/home/osdisks/amiga-os-310-workbench.adf';
    const wbDestLocation = path.join(global.BASE_DIR, 'execution', '20200401202930235', 'df1.adf');

    environmentSetup.insertDisk('df1', {location: '/home/osdisks/amiga-os-310-workbench.adf'});
    expect(fs.copyFileSync).toHaveBeenCalledTimes(1);
    expect(fs.copyFileSync).toHaveBeenCalledWith(wbSourceLocation, wbDestLocation);
    expect(fs.chmodSync).toHaveBeenCalledTimes(1);
    const diskLocation = path.join(global.BASE_DIR, 'execution', '20200401202930235', 'df1.adf');
    expect(fs.chmodSync).toHaveBeenCalledWith(diskLocation, 0o0666);
});
