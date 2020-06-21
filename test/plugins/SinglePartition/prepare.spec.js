const path = require('path');

const SinglePartition = require('../../../src/plugins/SinglePartition');

jest.mock('../../../src/services/HardDriveService');

const HardDriveService = require('../../../src/services/HardDriveService');

it('creates an RDB and attaches it to the environment', async () => {
    const environmentSetup = {
        executionFolder: 'some folder',
        attachHDF: jest.fn(),
    };
    const partition = new SinglePartition();
    await partition.prepare({optionValues: {device: 'A', size: 100}}, environmentSetup);

    expect(HardDriveService.createRDB).toHaveBeenCalledTimes(1);
    const expectedLocation = path.join('some folder', 'A.hdf');
    expect(HardDriveService.createRDB).toHaveBeenCalledWith(expectedLocation, 100, [{'driveName': 'A'}]);
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(1);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('A', expectedLocation);
});
