import fs from 'fs';
import path from 'path';

export default class PluginStore {
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
            const Plugin = (await import(path.join(pluginPath, pluginDir.name))).default;
            console.log(Plugin)
            const plugin = new Plugin();
            return plugin.structure();
        }));
    }

    async create(pluginName) {
        const Plugin = (await import(`../plugins/${pluginName}`)).default;
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
