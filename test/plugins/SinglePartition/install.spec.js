const SinglePartition = require('../../../src/plugins/SinglePartition');

it('calls the communicator to format the drive', async () => {
    const communicator = {format: jest.fn(), assign: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const partition = new SinglePartition();
    await partition.install({optionValues: {device: 'A:', volumeName: 'MyDrive'}}, communicator, pluginStore);

    expect(communicator.format).toHaveBeenCalledTimes(1);
    expect(communicator.format).toHaveBeenCalledWith('A:', 'MyDrive',
        {'REDIRECT_IN': 'ram:somefile.txt', 'ffs': true, 'intl': true, 'noicons': true, 'quick': true});
});

it('calls the communicator to assign NEW_WORKBENCH:', async () => {
    const communicator = {format: jest.fn(), assign: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const partition = new SinglePartition();
    await partition.install({optionValues: {device: 'A:', volumeName: 'MyDrive'}}, communicator, pluginStore);

    expect(communicator.assign).toHaveBeenCalledTimes(1);
    expect(communicator.assign).toHaveBeenCalledWith('NEW_WORKBENCH:', 'MyDrive:');
});
