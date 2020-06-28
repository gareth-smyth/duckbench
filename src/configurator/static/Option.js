export default class Option {
    view(node) {
        const configuration = node.attrs.configuration;
        const selectedPlugin = configuration.getSelectedPlugin(node.attrs.selectedPluginId);
        const optionValue = selectedPlugin.optionValues[node.attrs.name];
        const plugin = configuration.getPlugin(selectedPlugin.name);
        const option = plugin.options[node.attrs.name];
        if(!option.hide) {
            if(node.attrs.inline) {
                return [
                    m('.btn.pt-0.pb-0', option.label),
                    m('.btn.col-sm-6.pt-0.pb-0.text-left', [ this.option(selectedPlugin, option, optionValue, configuration) ]),
                ];
            } else {
                return m('.form-group row', {title: option.description}, [
                    m('label.col-sm-2.col-form-label.option-label', option.label),
                    m('.col-sm-9', [ this.option(selectedPlugin, option, optionValue, configuration) ]),
                ]);
            }
        }
    }

    option(selectedPlugin, option, optionValue, configuration) {
        if(option.type === 'text') {
            return m('input[type=text].form-control', {
                selectedPluginId: selectedPlugin.id,
                name: option.name,
                value: optionValue,
                onchange: (event) => { this.optionChanged(event, configuration) },
            });
        } else if(option.type === 'list'){
            return this.selectList(selectedPlugin, option, option.items, optionValue, configuration);
        }
    }

    selectList(selectedPlugin, option, optionItems, optionValue, configuration) {
        return m(`select.btn.btn-info.dropdown-toggle`, {
                selectedPluginId: selectedPlugin.id,
                name: option.name,
                value: optionValue,
                key: optionValue,
                onchange: (event) => {
                    this.optionChanged(event, configuration);
                },
            },
            optionItems.map(item => {
                if (typeof item === 'string') {
                    return m('option', {key: item, value: item}, item);
                } else {
                    return m('option', {key: item.key || item.value, value: item.value}, item.label);
                }
            }),
        );
    }

    optionChanged(event, configuration) {
        configuration.setSelectedPluginOptionValue(event.target.attributes.selectedPluginId.value, event.target.name, event.target.value);
    }
}
