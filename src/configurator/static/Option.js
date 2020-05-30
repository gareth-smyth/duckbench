export default class Option {
    view(node) {
        const configuration = node.attrs.configuration;
        const selectedPlugin = configuration.getSelectedPlugin(node.attrs.selectedPluginId);
        const optionValue = selectedPlugin.optionValues[node.attrs.name];
        const plugin = configuration.getPlugin(selectedPlugin.name);
        const option = plugin.options[node.attrs.name];
        if(node.attrs.inline) {
            return [
                m('.btn.pt-0.pb-0', option.label),
                m('.btn.col-sm-6.pt-0.pb-0', [ m('input[type=text].form-control', {selectedPluginId: selectedPlugin.id, name: option.name, value: optionValue, onchange: (event) => { this.optionChanged(event, configuration) } })]),
            ];
        } else {
            return m('.form-group row', {title: option.description}, [
                m('label.col-sm-2.col-form-label.option-label', option.label),
                m('.col-sm-9', [ m('input[type=text].form-control', {selectedPluginId: selectedPlugin.id, name: option.name, value: optionValue, onchange: (event) => { this.optionChanged(event, configuration) } })]),
            ]);
        }
    }

    optionChanged(event, configuration) {
        configuration.setSelectedPluginOptionValue(event.target.attributes.selectedPluginId.value, event.target.name, event.target.value);
    }
}
