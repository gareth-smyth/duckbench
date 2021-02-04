import Option from './Option.js';

export default class PluginConfig {
    view(node) {
        const configuration = node.attrs.configuration;
        const selectedPlugin = configuration.getSelectedPlugin(node.attrs.id);
        if(selectedPlugin.name) {
            const plugin = configuration.getPlugin(selectedPlugin.name);
            if(plugin.options) {
                return m('.form-group.mt-3.collapse', {'data-toggle': 'collapse', id: `config_${selectedPlugin.id}`, 'aria-expanded':'false'}, Object.keys(plugin.options).map(optionName => {
                    if(!plugin.options[optionName].primary) {
                        return m(Option, {configuration, selectedPluginId: selectedPlugin.id, name: optionName});
                    }
                }));
            }
        }
    }
}
