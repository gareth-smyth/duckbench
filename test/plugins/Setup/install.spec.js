const Communicator = require('../../../src/builder/Communicator');
const PluginStore = require('../../../src/builder/PluginStore');
const RedirectInputFile = require('../../../src/plugins/RedirectInputFile');

jest.mock('../../../src/builder/Communicator');
jest.mock('../../../src/builder/PluginStore');
jest.mock('../../../src/plugins/RedirectInputFile');

const Setup = require('../../../src/plugins/Setup');

let communicator;
let pluginStore;
let mockRedirectInputFile;
beforeEach(() => {
    communicator = new Communicator();
    pluginStore = new PluginStore();
    mockRedirectInputFile = new RedirectInputFile();
    pluginStore.getPlugin.mockReturnValue(mockRedirectInputFile);
    mockRedirectInputFile.createInput.mockResolvedValueOnce('ram:somefile.txt');
});

it('installs the hit enter file', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(mockRedirectInputFile.createInput).toHaveBeenCalledWith([''], communicator);
});

it('installs the duckbench partition', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.format).toHaveBeenCalledWith('DB0', 'DUCKBENCH', {
        ffs: true, quick: true, intl: true, noicons: true, REDIRECT_IN: 'ram:somefile.txt',
    });
});

it('installs the cache partition when does not exist', async () => {
    communicator.assign.mockResolvedValueOnce();
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.format).toHaveBeenCalledTimes(2);
    expect(communicator.format).toHaveBeenCalledWith('DB1', 'DB_CLIENT_CACHE', {
        ffs: true, quick: true, intl: true, noicons: true, REDIRECT_IN: 'ram:somefile.txt',
    });
});

it('installs the cache partition when does not exist', async () => {
    communicator.assign.mockImplementationOnce(() => {
        throw new Error('assign error');
    });
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.format).toHaveBeenCalledTimes(1);
});

it('makes duckbench:c folder', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.makedir).toHaveBeenCalledTimes(4);
    expect(communicator.makedir).toHaveBeenCalledWith('duckbench:c');
});

it('makes duckbench:envarc folder', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.makedir).toHaveBeenCalledTimes(4);
    expect(communicator.makedir).toHaveBeenCalledWith('duckbench:envarc');
});

it('adds duckbench:c to the path', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.path).toHaveBeenCalledTimes(1);
    expect(communicator.path).toHaveBeenCalledWith('duckbench:c', {'ADD': true});
});

it('makes duckbench:t folder', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.makedir).toHaveBeenCalledTimes(4);
    expect(communicator.makedir).toHaveBeenCalledWith('duckbench:t');
});

it('assigns t: to the duckbench:t folder', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.assign).toHaveBeenCalledWith('t:', 'duckbench:t');
});

it('assigns envarc: to the duckbench:envarc folder', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.assign).toHaveBeenCalledWith('envarc:', 'duckbench:envarc');
});

it('makes duckbench:disks folder', async () => {
    const setup = new Setup();
    await setup.install({}, communicator, pluginStore);

    expect(communicator.makedir).toHaveBeenCalledTimes(4);
    expect(communicator.makedir).toHaveBeenCalledWith('duckbench:disks');
});
