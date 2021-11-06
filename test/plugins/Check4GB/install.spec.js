const Check4GB = require('../../../src/plugins/Check4GB');

const pluginStore = {getPlugin: jest.fn()};
const lha = {run: jest.fn()};
const communicator = {copy: jest.fn(), delete: jest.fn()};

beforeEach(() => {
    pluginStore.getPlugin.mockReturnValue(lha);
});

it('calls the communicator to extract check4GB once for each location requested', async () => {
    const check4GB = new Check4GB();
    await check4GB.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await check4GB.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await check4GB.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(lha.run).toHaveBeenCalledTimes(2);
    expect(lha.run).toHaveBeenCalledWith('DB_HOST_CACHE:check4gb.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
});

it('throws an error when extraction fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('lha error');
    });

    const check4GB = new Check4GB();
    await expect(check4GB.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('lha error');
});

it('calls the communicator to copy check4GB once to each location requested', async () => {
    const check4GB = new Check4GB();
    await check4GB.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await check4GB.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await check4GB.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.copy).toHaveBeenCalledTimes(4);
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:Check4GB', 'A:');
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:Check4GB', 'B:');
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:Check4GB.filesys', 'A:');
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:Check4GB.filesys', 'B:');
});

it('throws an error when copying fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('copy error');
    });

    const check4GB = new Check4GB();
    await expect(check4GB.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('copy error');
});

it('throws an error when deleting fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('delete error');
    });

    const check4GB = new Check4GB();
    await expect(check4GB.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('delete error');
});
