const MockPluginStore = jest.fn();
jest.doMock('../../src/builder/PluginStore', () => MockPluginStore);
const mockPluginStoreInstance = {
    hasPlugin: jest.fn(),
    create: jest.fn(),
    add: jest.fn(),
    getPlugin: jest.fn(),
};
beforeEach(() => {
    MockPluginStore.mockImplementation(() => mockPluginStoreInstance);
    mockPluginStoreInstance.add.mockReset();
});

const Runner = require('../../src/builder/Runner');

describe('setupAndConfigure', () => {
    it('adds all passed in configs', () => {
        mockPluginStoreInstance.create.mockReturnValue({});
        const runner = new Runner();

        runner.configureAndSetup({name: 'Setup'}, [{name: 'config a'}, {name: 'config b'}]);

        expect(runner.configs.length).toEqual(2);
        expect(runner.configs[0]).toEqual({name: 'config a'});
        expect(runner.configs[1]).toEqual({name: 'config b'});
    });

    it('adds the setup config', () => {
        mockPluginStoreInstance.create.mockReturnValue({});
        const runner = new Runner();

        runner.configureAndSetup({name: 'Setup'}, [{name: 'config a'}, {name: 'config b'}]);

        expect(runner.setupConfig).toEqual({name: 'Setup'});
    });

    it('adds the setup plugin', () => {
        mockPluginStoreInstance.create.mockReturnValue({name: 'SetupPlugin'});
        const runner = new Runner();

        runner.configureAndSetup({name: 'Setup'}, [{name: 'config a'}, {name: 'config b'}]);

        expect(runner.setupPlugin).toEqual({name: 'SetupPlugin'});
        expect(mockPluginStoreInstance.add).toHaveBeenCalledWith('Setup', {name: 'SetupPlugin'});
    });

    it('adds child configs', () => {
        mockPluginStoreInstance.create.mockImplementation((pluginName) => {
            if ('a' === pluginName) {
                return {configure: () => [{name: 'c'}, {name: 'd'}]};
            } else if ('c' === pluginName) {
                return {configure: () => [{name: 'e'}, {name: 'f'}]};
            } else {
                return {configure: () => []};
            }
        });
        const runner = new Runner();

        runner.configureAndSetup({name: 'Setup'}, [{name: 'a'}, {name: 'b'}]);

        expect(runner.configs.length).toEqual(6);
        expect(runner.configs[0]).toEqual({name: 'e'});
        expect(runner.configs[1]).toEqual({name: 'f'});
        expect(runner.configs[2]).toEqual({name: 'c'});
        expect(runner.configs[3]).toEqual({name: 'd'});
        expect(runner.configs[4]).toEqual({name: 'a'});
        expect(runner.configs[5]).toEqual({name: 'b'});
    });

    it('adds plugins to the store', () => {
        mockPluginStoreInstance.create.mockImplementation((pluginName) => {
            if ('a' === pluginName) {
                return {name: pluginName, configure: () => [{name: 'c'}, {name: 'd'}]};
            } else if ('c' === pluginName) {
                return {name: pluginName, configure: () => [{name: 'e'}, {name: 'f'}]};
            } else {
                return {name: pluginName};
            }
        });
        const runner = new Runner();

        runner.configureAndSetup({name: 'Setup'}, [{name: 'a'}, {name: 'b'}]);

        expect(mockPluginStoreInstance.add).toHaveBeenCalledTimes(7);
        expect(mockPluginStoreInstance.add).toHaveBeenCalledWith('a', {name: 'a', configure: expect.any(Function)});
        expect(mockPluginStoreInstance.add).toHaveBeenCalledWith('b', {name: 'b'});
        expect(mockPluginStoreInstance.add).toHaveBeenCalledWith('c', {name: 'c', configure: expect.any(Function)});
        expect(mockPluginStoreInstance.add).toHaveBeenCalledWith('d', {name: 'd'});
        expect(mockPluginStoreInstance.add).toHaveBeenCalledWith('e', {name: 'e'});
        expect(mockPluginStoreInstance.add).toHaveBeenCalledWith('f', {name: 'f'});
    });

    it('only adds child configs once ', () => {
        mockPluginStoreInstance.create
            .mockReturnValueOnce({})
            .mockReturnValueOnce({configure: () => [{name: 'config c'}, {name: 'config d'}]})
            .mockReturnValueOnce({ })
            .mockReturnValueOnce({ })
            .mockReturnValueOnce({configure: () => [{name: 'config c'}, {name: 'config d'}]});
        mockPluginStoreInstance.hasPlugin.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const runner = new Runner();

        runner.configureAndSetup({name: 'Setup'}, [{name: 'config a'}, {name: 'config b'}]);

        expect(runner.configs.length).toEqual(4);
        expect(runner.configs[0]).toEqual({name: 'config c'});
        expect(runner.configs[1]).toEqual({name: 'config d'});
        expect(runner.configs[2]).toEqual({name: 'config a'});
        expect(runner.configs[3]).toEqual({name: 'config b'});
    });
});

describe('prepare', () => {
    it('calls prepare on all configs with a prepare method', async () => {
        const prepareFunc1 = jest.fn();
        const prepareFunc2 = jest.fn();
        mockPluginStoreInstance.getPlugin.mockReturnValueOnce({prepare: prepareFunc1})
            .mockReturnValueOnce({})
            .mockReturnValueOnce({prepare: prepareFunc2});

        const runner = new Runner();
        runner.configs = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
        runner.setupPlugin = {prepare: jest.fn()};
        const env = {};
        await runner.prepare(env);

        expect(prepareFunc1).toHaveBeenCalledTimes(1);
        expect(prepareFunc1).toHaveBeenCalledWith({name: 'a'}, env);
        expect(prepareFunc2).toHaveBeenCalledTimes(1);
        expect(prepareFunc2).toHaveBeenCalledWith({name: 'c'}, env);
    });

    it('calls prepare on all configs with a setup plugin', async () => {
        const runner = new Runner();
        runner.configs = [];
        runner.setupConfig = {name: 'Setup'};
        runner.setupPlugin = {prepare: jest.fn()};
        const env = {};
        await runner.prepare(env);

        expect(runner.setupPlugin.prepare).toHaveBeenCalledTimes(1);
        expect(runner.setupPlugin.prepare).toHaveBeenCalledWith({name: 'Setup'}, env);
    });
});

describe('install', () => {
    it('calls install on all plugins with a install method', async () => {
        const installFunc1 = jest.fn();
        const installFunc2 = jest.fn();
        mockPluginStoreInstance.getPlugin.mockReturnValueOnce({install: installFunc1})
            .mockReturnValueOnce({})
            .mockReturnValueOnce({install: installFunc2});

        const runner = new Runner();
        runner.configs = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
        runner.setupConfig = {name: 'Setup'};
        runner.setupPlugin = {install: jest.fn()};
        const communicator = {};
        const environmentSetup = {};
        await runner.install(communicator, environmentSetup);

        expect(installFunc1).toHaveBeenCalledTimes(1);
        expect(installFunc1).toHaveBeenCalledWith({name: 'a'}, communicator, mockPluginStoreInstance, environmentSetup);
        expect(installFunc2).toHaveBeenCalledTimes(1);
        expect(installFunc2).toHaveBeenCalledWith({name: 'c'}, communicator, mockPluginStoreInstance, environmentSetup);
    });

    it('calls install on the setup plugin', async () => {
        const runner = new Runner();
        runner.configs = [];
        runner.setupConfig = {name: 'Setup'};
        runner.setupPlugin = {install: jest.fn()};
        const communicator = {};
        const environmentSetup = {};
        await runner.install(communicator, environmentSetup);

        expect(runner.setupPlugin.install).toHaveBeenCalledTimes(1);
        expect(runner.setupPlugin.install).toHaveBeenCalledWith({name: 'Setup'}, communicator,
            mockPluginStoreInstance, environmentSetup);
    });
});

describe('finalise', () => {
    it('calls finalise on all plugins with a finalise method', async () => {
        const finaliseFunc1 = jest.fn();
        const finaliseFunc2 = jest.fn();
        mockPluginStoreInstance.getPlugin.mockReturnValueOnce({finalise: finaliseFunc1})
            .mockReturnValueOnce({})
            .mockReturnValueOnce({finalise: finaliseFunc2});

        const runner = new Runner();
        runner.configs = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
        const env = {};
        await runner.finalise(env);

        expect(finaliseFunc1).toHaveBeenCalledTimes(1);
        expect(finaliseFunc1).toHaveBeenCalledWith({name: 'a'}, env);
        expect(finaliseFunc2).toHaveBeenCalledTimes(1);
        expect(finaliseFunc2).toHaveBeenCalledWith({name: 'c'}, env);
    });
});
