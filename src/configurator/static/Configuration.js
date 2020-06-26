export default class Configuration {
    setPlugins(plugins) {
        this.plugins = plugins;
        this.currentId = 1001;
        this.selectedPlugins = [];

        const partitionPlugin = this.addSelectedPlugin('partition');
        this.setSelectedPluginName(partitionPlugin.id, 'SinglePartition');

        const workbenchPlugin = this.addSelectedPlugin('workbench');
        this.setSelectedPluginName(workbenchPlugin.id, 'InstallWorkbench310');

        const systemPlugin = this.addSelectedPlugin('system');
        this.setSelectedPluginName(systemPlugin.id, 'CD32');
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
        selectedPlugin.showConfig = plugin.showConfig;
        if(plugin.options) {
            Object.keys(plugin.options).forEach(optionName => {
                selectedPlugin.optionValues[optionName] = plugin.options[optionName].default;
            })
        }
    }

    setSelectedPluginOptionValue(pluginId, optionName, value) {
        const selectedPlugin = this.getSelectedPlugin(pluginId);
        selectedPlugin.optionValues[optionName] = value;
        if(selectedPlugin.type === 'partition' && (optionName === 'device')) {
            this.clearPartitionSelections();
        }
    }

    clearPartitionSelections() {
        this.selectedPlugins.forEach(selectedPlugin => {
            selectedPlugin.optionValues && Object.keys(selectedPlugin.optionValues).forEach(optionKey => {
                const plugin = this.getPlugin(selectedPlugin.name);
                if(plugin.options && plugin.options[optionKey] && plugin.options[optionKey].type === 'partition') {
                    if(selectedPlugin.optionValues[optionKey]) {
                        delete selectedPlugin.optionValues[optionKey];
                    }
                }
            })
        });
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
