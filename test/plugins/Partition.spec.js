const path = require('path');

const Partition = require('../../src/plugins/Partition');

jest.mock('../../src/services/RDBService');

const RDBService = require('../../src/services/RDBService');

it('returns HitEnterFile as a dependency', () => {
    const partition = new Partition();
    const config = partition.configure();

    expect(config).toEqual([{name: 'HitEnterFile'}]);
});

it('creates an RDB and attaches it to the environment', () => {
    const environmentSetup = {
        executionFolder: 'some folder',
        attachHDF: jest.fn(),
    };
    const partition = new Partition();
    partition.prepare({optionValues: {device: 'A', size: 100}}, environmentSetup);

    expect(RDBService.createRDB).toHaveBeenCalledTimes(1);
    const expectedLocation = path.join(process.cwd(), 'some folder', 'A.hdf');
    expect(RDBService.createRDB).toHaveBeenCalledWith(expectedLocation, 100, 'A');
    expect(environmentSetup.attachHDF).toHaveBeenCalledTimes(1);
    expect(environmentSetup.attachHDF).toHaveBeenCalledWith('A', expectedLocation);
});

it('calls the communicator to format the drive', async () => {
    const communicator = {sendCommand: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const partition = new Partition();
    await partition.install({optionValues: {device: 'A:', volumeName: 'MyDrive'}}, communicator, pluginStore);

    expect(communicator.sendCommand).toHaveBeenCalledTimes(1);
    expect(communicator.sendCommand)
        .toHaveBeenCalledWith('format drive A: name MyDrive ffs quick intl noicons < ram:somefile.txt');
});
