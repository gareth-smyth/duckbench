/* TODO These tests are not really testing the disk being built correctly as they use the same code to test as to run */

const fs = require('fs');
const path = require('path');

const HardDriveService = require('../../../src/services/HardDriveService');

jest.mock('../../../src/services/AminetService');
jest.mock('../../../src/services/LhaService');

const TEMP_FILE_PATH = __dirname;

function cleanTemp() {
    for (let index = 1; index <= 3; index++) {
        const fileName = path.join(TEMP_FILE_PATH, `test${index}.hdf`);
        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
    }
}

beforeEach(() => {
    global.OLD_CACHE_DIR = global.CACHE_DIR;
    global.CACHE_DIR = __dirname;
    cleanTemp();
});

afterEach(() => {
    global.CACHE_DIR = global.OLD_CACHE_DIR;
    cleanTemp();
});

it('creates the disk', async () => {
    await HardDriveService.createRDB(path.join(TEMP_FILE_PATH, 'test1.hdf'), 30, [
        {driveName: 'DH0', fileSystem: 'ffs', size: 10}, {driveName: 'DH1', fileSystem: 'ffs', size: 20},
    ]);
    const info = HardDriveService.info(path.join(TEMP_FILE_PATH, 'test1.hdf'));

    expect(info.info).toEqual( {
        'B per C': 1008, 'Block size': 512, 'Cylinders': 60, 'Flags': '10010',
        'Heads': 16, 'Park': 60, 'Sectors': 63, 'Size': '30 MB',
    });
});

it('creates the partitions', async () => {
    await HardDriveService.createRDB(path.join(TEMP_FILE_PATH, 'test2.hdf'), 30, [
        {driveName: 'DH0', fileSystem: 'ffs', size: 10}, {driveName: 'DH1', fileSystem: 'pfs', size: 20},
    ]);
    const info = HardDriveService.info(path.join(TEMP_FILE_PATH, 'test2.hdf'));

    expect(info.partitionInfo).toEqual( [
        {'Drive name': 'DH0', 'End Cylinder': 20, 'File system': 'DOS3', 'Size': '9.84375 MB', 'Start Cylinder': 1},
        {'Drive name': 'DH1', 'End Cylinder': 59, 'File system': 'PDS3', 'Size': '19.1953125 MB', 'Start Cylinder': 21},
    ]);
});

it('creates the filesystems', async () => {
    await HardDriveService.createRDB(path.join(TEMP_FILE_PATH, 'test3.hdf'), 10, [
        {driveName: 'DH0', fileSystem: 'ffs'},
        {driveName: 'DH1', fileSystem: 'pfs'},
        {driveName: 'DH2', fileSystem: 'pfs'},
    ]);
    const info = HardDriveService.info(path.join(TEMP_FILE_PATH, 'test3.hdf'));

    expect(info.fileSystemInfo).toEqual( [{'File system': 'PDS3', 'Version': '19.2', 'Number of LoadSegs': 2}]);
});

it('throws an error when the filesystem does not exist', async () => {
    await expect(HardDriveService.createRDB(path.join(TEMP_FILE_PATH, 'test3.hdf'), 10, [
        {driveName: 'DH0', fileSystem: 'ffs'},
        {driveName: 'DH1', fileSystem: 'pfs'},
        {driveName: 'DH2', fileSystem: 'sfs'},
    ])).rejects.toThrowError('Can not install the selected file system');
});
