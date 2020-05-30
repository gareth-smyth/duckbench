export default class Configuration {
    constructor() {
        this.currentId = 1001;
        this.selectedPlugins = [];
        this.addSelectedPlugin('root');
    }

    setPlugins(plugins) {
        this.plugins = plugins;
    }

    setSelectedPluginName(id, pluginName) {
        const selectedPlugin = this.getSelectedPlugin(id);
        selectedPlugin.name = pluginName;
        selectedPlugin.optionValues = {};
        this.setDefaultValues(selectedPlugin, pluginName);
    }

    toggleConfig(id) {
        const selectedPlugin = this.getSelectedPlugin(id);
        selectedPlugin.showConfig = !selectedPlugin.showConfig;
    }

    removePlugin(id) {
        this.selectedPlugins.splice(this.selectedPlugins.findIndex(plugin => plugin.id === id), 1)
    }

    setDefaultValues(selectedPlugin, pluginName) {
        const plugin = this.plugins.find(plugin => plugin.name === pluginName);
        if(plugin.options) {
            Object.keys(plugin.options).forEach(optionName => {
                selectedPlugin.optionValues[optionName] = plugin.options[optionName].default;
            })
        }
    }

    setSelectedPluginOptionValue(pluginId, optionName, value) {
        this.getSelectedPlugin(pluginId).optionValues[optionName] = value;
    }

    addSelectedPlugin(type) {
        const newId = String(this.currentId++);
        this.selectedPlugins.push({type, id: newId, optionValues: {}});
    }

    getRootSelectedPlugin() {
        return this.selectedPlugins.find(selectedPlugin => selectedPlugin.type === 'root');
    }

    getNonRootSelectedPlugins() {
        return this.selectedPlugins.filter(selectedPlugin => selectedPlugin.type !== 'root');
    }

    getSelectedPlugin(id) {
        return this.selectedPlugins.find(selectedPlugin => selectedPlugin.id === id);
    }

    getPlugin(name) {
        return this.plugins.find(plugin => plugin.name === name);
    }

    findCurrentId() {
        this.currentId = this.selectedPlugins.reduce((id, selectedPlugin) => Math.max(id, Number(selectedPlugin.id)), 0) + 1;
    }
}
