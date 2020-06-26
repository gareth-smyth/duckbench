const fs = require('fs');
const path = require('path');

class PluginStore {
    constructor() {
        this.plugins = {};
    }

    static async getStructures() {
        const pluginPath = path.join(__dirname, '../', 'plugins');
        const pluginsDir = fs.opendirSync(pluginPath);
        const plugins = [];
        let directoryEntry;
        while ((directoryEntry = pluginsDir.readSync()) !== null) {
            plugins.push(directoryEntry);
        }
        plugins.sort();
        await pluginsDir.close();
        return Promise.all(plugins.filter((pluginDir) => pluginDir.isDirectory()).map(async (pluginDir) => {
            const Plugin = require(path.join(pluginPath, pluginDir.name));
            const plugin = new Plugin();
            return await plugin.structure();
        }));
    }

    create(pluginName) {
        const Plugin = require(`../plugins/${pluginName}`);
        return new Plugin();
    }

    add(pluginName, plugin) {
        this.plugins[pluginName.toLocaleLowerCase()] = plugin;
    }

    hasPlugin(pluginName) {
        return !!this.plugins[pluginName.toLocaleLowerCase()];
    }

    getPlugin(pluginName) {
        return this.plugins[pluginName.toLocaleLowerCase()];
    }
}

module.exports = PluginStore;
