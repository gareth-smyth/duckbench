const UnADF = require('../../../src/plugins/UnADF');

const pluginStore = {getPlugin: jest.fn()};
const lha = {run: jest.fn()};
const communicator = 'aCommunicator';

beforeEach(() => {
    pluginStore.getPlugin.mockReset();
    pluginStore.getPlugin.mockReturnValue(lha);
    lha.run.mockReset();
});

it('calls the communicator to install unADF once in each location requested', async () => {
    const unADF = new UnADF();
    await unADF.install({
        optionValues: {
            location: 'A:', sourceDir: 'aDir:', sourceFile: 'aFile', dest: 'wb:',
        },
    }, communicator, pluginStore);
    await unADF.install({
        optionValues: {
            location: 'A:', sourceDir: 'aDir:', sourceFile: 'aFile', dest: 'wb:',
        },
    }, communicator, pluginStore);
    await unADF.install({
        optionValues: {
            location: 'B:', sourceDir: 'bDir:', sourceFile: 'bFile', dest: 'work:',
        },
    }, communicator, pluginStore);

    expect(lha.run).toHaveBeenCalledTimes(2);
    expect(lha.run).toHaveBeenCalledWith('DB_TOOLS:UnADF.lha', 'A:', 'duckbench:c/', {}, communicator);
    expect(lha.run).toHaveBeenCalledWith('DB_TOOLS:UnADF.lha', 'B:', 'duckbench:c/', {}, communicator);
});

it('throws an error when extraction throws', async () => {
    lha.run.mockImplementation(() => {
        throw new Error('lha error');
    });

    const unADF = new UnADF();
    await expect(unADF.install({
        optionValues: {
            location: 'A:', sourceDir: 'aDir:', sourceFile: 'aFile', dest: 'wb:',
        },
    }, communicator, pluginStore)).rejects.toThrowError('lha error');
});
