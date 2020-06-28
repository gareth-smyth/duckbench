import PluginConfig from './PluginConfig.js';
import Option from './Option.js';

export default class PluginSelect {
    view(node) {
        const configuration = node.attrs.configuration;
        const plugins = configuration.plugins;
        const selectedPlugin = configuration.getSelectedPlugin(node.attrs.id);
        const primaryConfigOption = this.getPrimaryConfigurationOption(configuration, selectedPlugin);
        const showConfigButton = this.getNonPrimaryNonHiddenConfigurationOptions(configuration, selectedPlugin);
        return m('.mb-1', [
            m('select.btn.btn-info.dropdown-toggle', {
                    id:`${selectedPlugin.id}`,
                    value: selectedPlugin.name,
                    onchange: (event) => { this.selectPluginChange(event, configuration) }
                },
                Object.keys(plugins).filter(pluginName => {
                    return this.typeMatch(node.attrs.ignoreTypes, node.attrs.includeTypes, plugins[pluginName].type) && plugins[pluginName].name;
                }).map(configKey => {
                    return plugins[configKey];
                }).map(plugin => {
                    return m('option', { key: plugin.name, value: plugin.name }, plugin.label)
                }),
            ),
            (selectedPlugin.name && showConfigButton) ? m('.btn.btn-info.ml-1', { onclick: () => { this.toggleConfig(selectedPlugin.id, configuration) } }, [
                m('img', { src: "./images/gear-fill.svg", width:"23", height:"23", title:"Configure"}),
            ]): '',
            !node.attrs.noRemove ? m('.btn.btn-info.ml-1', { onclick: () => { this.removePlugin(selectedPlugin.id, configuration) } }, [
                m('img', { src: "./images/x-square-fill.svg", width:"23", height:"23", title:"Remove"}),
            ]): '',
            primaryConfigOption ? m(Option, {configuration: configuration, selectedPluginId: selectedPlugin.id, name: primaryConfigOption.name, inline: true}) : '',
            m(PluginConfig, { configuration, id: selectedPlugin.id } ),
        ]);
    }

    getPrimaryConfigurationOption(configuration, selectedPlugin) {
        const plugin = configuration.getPlugin(selectedPlugin.name);
        if(plugin && plugin.options) {
            const optionName = Object.keys(plugin.options).find(optionName => plugin.options[optionName].primary === true);
            return plugin.options[optionName];
        }
    }

    getNonPrimaryNonHiddenConfigurationOptions(configuration, selectedPlugin) {
        const plugin = configuration.getPlugin(selectedPlugin.name);
        if(plugin && plugin.options) {
            return Object.keys(plugin.options)
                .find(optionName => plugin.options[optionName].primary !== true && !plugin.options[optionName].hide);
        }

        return false;
    }

    selectPluginChange(event, configuration) {
        configuration.setSelectedPluginName(event.target.id, event.target.value);
    }

    toggleConfig(id, configuration) {
        configuration.toggleConfig(id);
    }

    removePlugin(id, configuration) {
        configuration.removePlugin(id);
    }

    typeMatch(ignoreTypes, includeTypes, type) {
        let match = true;
        if(ignoreTypes) {
            match = match && !ignoreTypes.includes(type);
        }
        if(includeTypes) {
            match = match && includeTypes.includes(type);
        }
        return match;
    }
}
