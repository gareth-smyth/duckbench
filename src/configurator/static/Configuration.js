export default class Configuration {
    setPlugins(plugins) {
        this.plugins = plugins;
        this.currentId = 1001;
        this.selectedPlugins = [];

        const partitionPlugin = this.addSelectedPlugin('partition');
        this.setSelectedPluginName(partitionPlugin.id, 'RecommendedPartition');

        const workbenchPlugin = this.addSelectedPlugin('workbench');
        this.setSelectedPluginName(workbenchPlugin.id, 'InstallWorkbench390');

        const systemPlugin = this.addSelectedPlugin('system');
        this.setSelectedPluginName(systemPlugin.id, 'Amiga1200');
    }

    setSettings(settings) {
        this.settings = settings;
    }

    setCurrentSettings(currentSettings) {
        this.currentSettings = currentSettings;
    }

    setSelectedPluginName(id, pluginName) {
        const selectedPlugin = this.getSelectedPlugin(id);
        selectedPlugin.name = pluginName;
        selectedPlugin.optionValues = {};
        this.setDefaultValues(selectedPlugin, pluginName);
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
        const selectedPlugin = this.getSelectedPlugin(pluginId);
        selectedPlugin.optionValues[optionName] = value;
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

    getSystemSelectedPlugin() {
        return this.selectedPlugins.find(selectedPlugin => selectedPlugin.type === 'system');
    }

    getPartitionSelectedPlugin() {
        return this.selectedPlugins.find(selectedPlugin => selectedPlugin.type === 'partition');
    }

    getNonRootSelectedPlugins() {
        return this.selectedPlugins.filter(selectedPlugin =>
            selectedPlugin.type !== 'workbench' && selectedPlugin.type !== 'partition' && selectedPlugin.type !== 'system');
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
