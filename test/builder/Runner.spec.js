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
});

const Runner = require('../../src/builder/Runner');

describe('configure', () => {
    it('adds all passed in configs', () => {
        mockPluginStoreInstance.create.mockReturnValue({});
        const runner = new Runner();

        runner.configure([{name: 'config a'}, {name: 'config b'}]);

        expect(runner.configs.length).toEqual(2);
        expect(runner.configs[0]).toEqual({name: 'config a'});
        expect(runner.configs[1]).toEqual({name: 'config b'});
    });

    it('adds child configs', () => {
        mockPluginStoreInstance.create
            .mockReturnValueOnce({configure: () => [{name: 'config c'}, {name: 'config d'}]})
            .mockReturnValueOnce({configure: () => [{name: 'config e'}, {name: 'config f'}]});
        const runner = new Runner();

        runner.configure([{name: 'config a'}, {name: 'config b'}]);

        expect(runner.configs.length).toEqual(6);
        expect(runner.configs[0]).toEqual({name: 'config e'});
        expect(runner.configs[1]).toEqual({name: 'config f'});
        expect(runner.configs[2]).toEqual({name: 'config c'});
        expect(runner.configs[3]).toEqual({name: 'config d'});
        expect(runner.configs[4]).toEqual({name: 'config a'});
        expect(runner.configs[5]).toEqual({name: 'config b'});
    });

    it('only adds child configs once ', () => {
        mockPluginStoreInstance.create
            .mockReturnValueOnce({configure: () => [{name: 'config c'}, {name: 'config d'}]})
            .mockReturnValueOnce({ })
            .mockReturnValueOnce({ })
            .mockReturnValueOnce({configure: () => [{name: 'config c'}, {name: 'config d'}]});
        mockPluginStoreInstance.hasPlugin.mockReturnValueOnce(false).mockReturnValueOnce(true);
        const runner = new Runner();

        runner.configure([{name: 'config a'}, {name: 'config b'}]);

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
        const env = {};
        await runner.prepare(env);

        expect(prepareFunc1).toHaveBeenCalledTimes(1);
        expect(prepareFunc1).toHaveBeenCalledWith({name: 'a'}, env);
        expect(prepareFunc2).toHaveBeenCalledTimes(1);
        expect(prepareFunc2).toHaveBeenCalledWith({name: 'c'}, env);
    });
});

describe('install', () => {
    it('calls install on all configs with a install method', async () => {
        const installFunc1 = jest.fn();
        const installFunc2 = jest.fn();
        mockPluginStoreInstance.getPlugin.mockReturnValueOnce({install: installFunc1})
            .mockReturnValueOnce({})
            .mockReturnValueOnce({install: installFunc2});

        const runner = new Runner();
        runner.configs = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
        const communicator = {};
        await runner.install(communicator);

        expect(installFunc1).toHaveBeenCalledTimes(1);
        expect(installFunc1).toHaveBeenCalledWith({name: 'a'}, communicator, mockPluginStoreInstance);
        expect(installFunc2).toHaveBeenCalledTimes(1);
        expect(installFunc2).toHaveBeenCalledWith({name: 'c'}, communicator, mockPluginStoreInstance);
    });
});

describe('finalise', () => {
    it('calls finalise on all configs with a finalise method', async () => {
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
