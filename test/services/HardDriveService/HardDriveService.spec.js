/* TODO These tests are not really the disk being built correctly as they use the same code to test as to run */

const HardDriveService = require('../../../src/services/HardDriveService');
const fs = require('fs');
const path = require('path');

const TEMP_FILE_PATH = __dirname;

function cleanTemp() {
    for (let index = 1; index < 3; index++) {
        const fileName = path.join(TEMP_FILE_PATH, `test${index}.hdf`);
        if (fs.existsSync(fileName)) {
            fs.unlinkSync(fileName);
        }
    }
}

beforeEach(() => {
    cleanTemp();
});

afterEach(() => {
    cleanTemp();
});

it('creates the disk', () => {
    HardDriveService.createRDB(path.join(TEMP_FILE_PATH, 'test1.hdf'), 10, [{driveName: 'DH0'}, {driveName: 'DH1'}]);
    const info = HardDriveService.info(path.join(TEMP_FILE_PATH, 'test1.hdf'));

    expect(info.info).toEqual( {
        'B per C': 32, 'Block size': 512, 'Cylinders': 640, 'Flags': '111',
        'Heads': 1, 'Park': 640, 'Sectors': 32, 'Size': '10 MB',
    });
});

it('creates the partitions', () => {
    HardDriveService.createRDB(path.join(TEMP_FILE_PATH, 'test2.hdf'), 10, [{driveName: 'DH0'}, {driveName: 'DH1'}]);
    const info = HardDriveService.info(path.join(TEMP_FILE_PATH, 'test2.hdf'));

    expect(info.partitionInfo).toEqual( [
        {'Drive name': 'DH0', 'End Cylinder': 320, 'File system': 'DOS3', 'Size': '5 MB', 'Start Cylinder': 1},
        {'Drive name': 'DH1', 'End Cylinder': 640, 'File system': 'DOS3', 'Size': '5 MB', 'Start Cylinder': 321},
    ]);
});
