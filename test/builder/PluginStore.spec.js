const PluginStore = require('../../src/builder/PluginStore');

describe('access plugin store', () => {
    it('adds plugins to store', () => {
        const pluginStore = new PluginStore();
        pluginStore.add('a plugin', 'some plugin');

        expect(pluginStore.getPlugin('a plugin')).toEqual('some plugin');
    });

    it('gets plugins even in different case', () => {
        const pluginStore = new PluginStore();
        pluginStore.add('a plugin', 'some plugin');

        expect(pluginStore.getPlugin('A PLUGIN')).toEqual('some plugin');
    });

    it('returns true for hasPlugin when a plugin has been added to the store', () => {
        const pluginStore = new PluginStore();
        pluginStore.add('a plugin', 'some plugin');

        expect(pluginStore.hasPlugin('a plugin')).toEqual(true);
    });

    it('returns true for hasPlugin when a plugin has been added to the store even in a different case', () => {
        const pluginStore = new PluginStore();
        pluginStore.add('a plugin', 'some plugin');

        expect(pluginStore.hasPlugin('A PLUGIN')).toEqual(true);
    });

    it('returns false for hasPlugin when a plugin has not been added to the store', () => {
        const pluginStore = new PluginStore();
        pluginStore.add('a plugin', 'some plugin');

        expect(pluginStore.hasPlugin('another plugin')).toEqual(false);
    });
});

it('creates new plugins', () => {
    class MockPlugin {}

    jest.mock('../../src/plugins/MockPlugin', () => MockPlugin, {virtual: true});

    const pluginStore = new PluginStore();
    const newPlugin = pluginStore.create('MockPlugin');
    expect(newPlugin).toBeInstanceOf(MockPlugin);
});

it('gets all plugin structures', async () => {
    const structures = (await PluginStore.getStructures()).sort((a, b) => a.name.localeCompare(b.name));
    expect(structures.length).toBeGreaterThan(1);
    expect(structures[0].name).toEqual('Amiga1200');
    expect(structures[0].label).toEqual('Amiga 1200');
});
