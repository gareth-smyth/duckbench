const SinglePartition = require('../../../src/plugins/SinglePartition');

it('calls the communicator to format the drive', async () => {
    const communicator = {format: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const partition = new SinglePartition();
    await partition.install({optionValues: {device: 'A:', volumeName: 'MyDrive'}}, communicator, pluginStore);

    expect(communicator.format).toHaveBeenCalledTimes(1);
    expect(communicator.format).toHaveBeenCalledWith('A:', 'MyDrive',
        {'REDIRECT_IN': 'ram:somefile.txt', 'ffs': true, 'intl': true, 'noicons': true, 'quick': true});
});
