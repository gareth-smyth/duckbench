const path = require('path');

const SinglePartition = require('../../../src/plugins/SinglePartition');

jest.mock('../../../src/services/RDBService');

const RDBService = require('../../../src/services/RDBService');

it('creates an RDB and attaches it to the environment', () => {
    const environmentSetup = {
        executionFolder: 'some folder',
        attachHDF: jest.fn(),
    };
    const partition = new SinglePartition();
    partition.prepare({optionValues: {device: 'A', size: 100}}, environmentSetup);

    expect(RDBService.createRDB).toHaveBeenCalledTimes(1);
    const expectedLocation = path.join('some folder', 'A.hdf');
    expect(RDBService.createRDB).toHaveBeenCalledWith(expectedLocation, 100, 'A');
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(1);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('A', expectedLocation);
});
