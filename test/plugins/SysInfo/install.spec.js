const SysInfo = require('../../../src/plugins/SysInfo');

const pluginStore = {getPlugin: jest.fn()};
const lha = {run: jest.fn()};
const communicator = {copy: jest.fn(), delete: jest.fn()};

beforeEach(() => {
    pluginStore.getPlugin.mockReturnValue(lha);
});

it('calls the communicator to extract sysInfo once for each location requested', async () => {
    const sysInfo = new SysInfo();
    await sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await sysInfo.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(lha.run).toHaveBeenCalledTimes(2);
    expect(lha.run).toHaveBeenCalledWith('DB_HOST_CACHE:SysInfo.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
});

it('throws an error when extraction fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('lha error');
    });

    const sysInfo = new SysInfo();
    await expect(sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('lha error');
});

it('calls the communicator to copy sysInfo once to each location requested', async () => {
    const sysInfo = new SysInfo();
    await sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await sysInfo.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.copy).toHaveBeenCalledTimes(4);
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:SysInfo', 'A:SysInfo',
        {'ALL': true, 'CLONE': true}, undefined, 'copied');
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:SysInfo.info', 'B:SysInfo.info', {'CLONE': true});
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:SysInfo', 'A:SysInfo',
        {'ALL': true, 'CLONE': true}, undefined, 'copied');
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:SysInfo.info', 'B:SysInfo.info', {'CLONE': true});
});

it('throws an error when copying fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('copy error');
    });

    const sysInfo = new SysInfo();
    await expect(sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('copy error');
});

it('calls the communicator to delete extracted sysInfo once for each location requested', async () => {
    const sysInfo = new SysInfo();
    await sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await sysInfo.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.delete).toHaveBeenCalledTimes(2);
    expect(communicator.delete).toHaveBeenCalledWith('duckbench:SysInfo', {'ALL': true});
});

it('throws an error when deleting fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('delete error');
    });

    const sysInfo = new SysInfo();
    await expect(sysInfo.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('delete error');
});
