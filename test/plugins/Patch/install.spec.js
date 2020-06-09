const Patch = require('../../../src/plugins/Patch');

const pluginStore = {getPlugin: jest.fn()};
const lha = {run: jest.fn()};
const communicator = {copy: jest.fn(), delete: jest.fn()};

beforeEach(() => {
    pluginStore.getPlugin.mockReset();
    pluginStore.getPlugin.mockReturnValue(lha);
    lha.run.mockReset();
    communicator.copy.mockReset();
    communicator.delete.mockReset();
});

it('calls the communicator to extract patch once for each location requested', async () => {
    const patch = new Patch();
    await patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await patch.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(lha.run).toHaveBeenCalledTimes(2);
    expect(lha.run).toHaveBeenCalledWith('DB_TOOLS:patch-2.1.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
});

it('throws an error when extraction fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('lha error');
    });

    const patch = new Patch();
    await expect(patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('lha error');
});

it('calls the communicator to copy patch once to each location requested', async () => {
    const patch = new Patch();
    await patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await patch.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.copy).toHaveBeenCalledTimes(2);
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:patch-2.1/c/patch', 'A:');
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:patch-2.1/c/patch', 'B:');
});

it('throws an error when copying fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('copy error');
    });

    const patch = new Patch();
    await expect(patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('copy error');
});

it('calls the communicator to delete extracted patch once for each location requested', async () => {
    const patch = new Patch();
    await patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await patch.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.delete).toHaveBeenCalledTimes(2);
    expect(communicator.delete).toHaveBeenCalledWith('duckbench:patch-2.1', {'ALL': true});
});

it('throws an error when deleting fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('delete error');
    });

    const patch = new Patch();
    await expect(patch.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('delete error');
});
