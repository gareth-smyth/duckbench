const MockPartition = jest.fn();
const MockHitEnterFile = jest.fn();
jest.mock('../../../src/plugins/SinglePartition', () => MockPartition);
jest.mock('../../../src/plugins/HitEnterFile', () => MockHitEnterFile);

const mockPartitionInstance = {
    install: jest.fn(),
    prepare: jest.fn(),
};

const mockHitEnterFileInstance = {
    install: jest.fn(),
};

const Setup = require('../../../src/plugins/Setup');

beforeEach(() => {
    MockPartition.mockImplementation(() => mockPartitionInstance);
    MockHitEnterFile.mockImplementation(() => mockHitEnterFileInstance);
});

it('installs the hit enter file', async () => {
    const communicator = {makedir: jest.fn(), assign: jest.fn(), path: jest.fn()};

    const setup = new Setup();
    await setup.install({}, communicator);

    expect(MockHitEnterFile).toHaveBeenCalledWith();
    expect(mockHitEnterFileInstance.install).toHaveBeenCalledWith({}, communicator);
});

it('installs the partition', async () => {
    const communicator = {makedir: jest.fn(), assign: jest.fn(), path: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(MockPartition).toHaveBeenCalledWith();
    expect(mockPartitionInstance.install).toHaveBeenCalledWith({
        name: 'SinglePartition',
        optionValues: {
            device: 'DH1',
            volumeName: 'DUCKBENCH',
            size: 100,
        },
    }, communicator, pluginStore);
});

it('makes duckbench:c folder', async () => {
    const communicator = {makedir: jest.fn(), assign: jest.fn(), path: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.makedir).toHaveBeenCalledTimes(3);
    expect(communicator.makedir).toHaveBeenCalledWith('duckbench:c');
});

it('adds duckbench:c to the path', async () => {
    const communicator = {makedir: jest.fn(), assign: jest.fn(), path: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.path).toHaveBeenCalledTimes(1);
    expect(communicator.path).toHaveBeenCalledWith('duckbench:c', {'ADD': true});
});

it('makes duckbench:t folder', async () => {
    const communicator = {makedir: jest.fn(), assign: jest.fn(), path: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.makedir).toHaveBeenCalledTimes(3);
    expect(communicator.makedir).toHaveBeenCalledWith('duckbench:t');
});

it('assigns t: to the duckbench:t folder', async () => {
    const communicator = {makedir: jest.fn(), assign: jest.fn(), path: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.assign).toHaveBeenCalledTimes(1);
    expect(communicator.assign).toHaveBeenCalledWith('t:', 'duckbench:t');
});

it('makes duckbench:disks folder', async () => {
    const communicator = {makedir: jest.fn(), assign: jest.fn(), path: jest.fn()};
    const pluginStore = {getPlugin: () => ({getFile: () => 'ram:somefile.txt'})};

    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.makedir).toHaveBeenCalledTimes(3);
    expect(communicator.makedir).toHaveBeenCalledWith('duckbench:disks');
});
