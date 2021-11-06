const MMULib = require('../../../src/plugins/MMULib');

const pluginStore = {getPlugin: jest.fn()};
const lha = {run: jest.fn()};
const communicator = {copy: jest.fn(), delete: jest.fn(), echo: jest.fn()};

beforeEach(() => {
    pluginStore.getPlugin.mockReturnValue(lha);
});

it('calls the communicator to extract mmuLib once for each location requested', async () => {
    const mmuLib = new MMULib();
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(lha.run).toHaveBeenCalledTimes(2);
    expect(lha.run).toHaveBeenCalledWith('DB_HOST_CACHE:MMULib.lha', 'duckbench:', 'duckbench:c/', {}, communicator);
});

it('throws an error when extraction fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('lha error');
    });

    const mmuLib = new MMULib();
    await expect(mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('lha error');
});

it('calls the communicator to copy mmuLib once to each location requested', async () => {
    const mmuLib = new MMULib();
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.copy).toHaveBeenCalledTimes(4);
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:MMULib', 'A:MMULib',
        {'ALL': true, 'CLONE': true}, undefined, 'copied');
    expect(communicator.copy).toHaveBeenCalledWith(
        'duckbench:MMULib/Libs/mmu.library', 'DH0:libs/', {'CLONE': true});
    expect(communicator.copy).toHaveBeenCalledWith('duckbench:MMULib', 'A:MMULib',
        {'ALL': true, 'CLONE': true}, undefined, 'copied');
    expect(communicator.copy).toHaveBeenCalledWith(
        'duckbench:MMULib/Libs/mmu.library', 'DH0:libs/', {'CLONE': true});
});

it('throws an error when copying fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('copy error');
    });

    const mmuLib = new MMULib();
    await expect(mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('copy error');
});

it('calls the communicator to delete extracted mmuLib once for each location requested', async () => {
    const mmuLib = new MMULib();
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.delete).toHaveBeenCalledTimes(2);
    expect(communicator.delete).toHaveBeenCalledWith('duckbench:MMULib', {'ALL': true});
});

it('writes the startup line for MUFastRom to user-startup', async () => {
    const mmuLib = new MMULib();
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore);
    await mmuLib.install({optionValues: {location: 'B:'}}, communicator, pluginStore);

    expect(communicator.echo).toHaveBeenCalledTimes(2);
    expect(communicator.echo).toHaveBeenCalledWith('A:MMULib/MUTools/MuFastRom',
        {'>>': 'dh0:s/user-startup', 'Protect': true, 'on': true});
    expect(communicator.echo).toHaveBeenCalledWith('B:MMULib/MUTools/MuFastRom',
        {'>>': 'dh0:s/user-startup', 'Protect': true, 'on': true});
});

it('throws an error when deleting fails', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('delete error');
    });

    const mmuLib = new MMULib();
    await expect(mmuLib.install({optionValues: {location: 'A:'}}, communicator, pluginStore))
        .rejects.toThrowError('delete error');
});
