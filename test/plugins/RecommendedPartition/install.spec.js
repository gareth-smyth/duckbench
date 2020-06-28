const RecommendedPartition = require('../../../src/plugins/RecommendedPartition');

it('calls the communicator to format the workbench partition', async () => {
    const communicator = {format: jest.fn(), assign: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const partition = new RecommendedPartition();
    await partition.install({optionValues: {size: 300}}, communicator, pluginStore);

    expect(communicator.assign).toHaveBeenCalledTimes(1);
    expect(communicator.format).toHaveBeenCalledTimes(1);
    expect(communicator.format).toHaveBeenCalledWith('DH0', 'WORKBENCH',
        {'REDIRECT_IN': 'ram:somefile.txt', 'intl': true, 'noicons': true, 'quick': true});
});

it('assigns work: to dh1:', async () => {
    const communicator = {format: jest.fn(), assign: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const partition = new RecommendedPartition();
    await partition.install({optionValues: {size: 300}}, communicator, pluginStore);

    expect(communicator.assign).toHaveBeenCalledTimes(1);
    expect(communicator.assign).toHaveBeenCalledWith('WORK:', 'DH0:');
});

describe('large hard drive set up', () => {
    it('calls the communicator to format the workbench partition', async () => {
        const communicator = {format: jest.fn(), assign: jest.fn()};
        const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

        const partition = new RecommendedPartition();
        await partition.install({optionValues: {size: 5000}}, communicator, pluginStore);

        expect(communicator.assign).toHaveBeenCalledTimes(0);
        expect(communicator.format).toHaveBeenCalledTimes(2);
        expect(communicator.format).toHaveBeenCalledWith('DH0', 'WORKBENCH',
            {'REDIRECT_IN': 'ram:somefile.txt', 'intl': true, 'noicons': true, 'quick': true});
    });

    it('calls the communicator to format the work partition', async () => {
        const communicator = {format: jest.fn(), assign: jest.fn()};
        const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

        const partition = new RecommendedPartition();
        await partition.install({optionValues: {size: 5000}}, communicator, pluginStore);

        expect(communicator.assign).toHaveBeenCalledTimes(0);
        expect(communicator.format).toHaveBeenCalledTimes(2);
        expect(communicator.format).toHaveBeenCalledWith('DH1', 'WORK',
            {'REDIRECT_IN': 'ram:somefile.txt', 'intl': true, 'noicons': true, 'quick': true});
    });
});
