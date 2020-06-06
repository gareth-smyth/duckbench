export default class Configuration {
    setPlugins(plugins) {
        this.plugins = plugins;
        this.currentId = 1001;
        this.selectedPlugins = [];
        const partitionPlugin = this.addSelectedPlugin('partition');
        this.setSelectedPluginName(partitionPlugin.id, 'SinglePartition');
        this.addSelectedPlugin('workbench');
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
        const newPlugin = {type, id: newId, optionValues: {}};
        this.selectedPlugins.push(newPlugin);
        return newPlugin;
    }

    getWorkbenchSelectedPlugin() {
        return this.selectedPlugins.find(selectedPlugin => selectedPlugin.type === 'workbench');
    }

    getPartitionSelectedPlugin() {
        return this.selectedPlugins.find(selectedPlugin => selectedPlugin.type === 'partition');
    }

    getNonRootSelectedPlugins() {
        return this.selectedPlugins.filter(selectedPlugin =>
            selectedPlugin.type !== 'workbench' && selectedPlugin.type !== 'partition');
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
