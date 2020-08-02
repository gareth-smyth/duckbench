export default class Setting {
    view(node) {
        const plugin = node.attrs.plugin;
        const setting = node.attrs.setting;
        const currentSetting = node.attrs.currentSetting;
        return m('.form-group row', [
            m('label.col-sm-2.col-form-label.option-label', setting.label),
            m('.col-sm-9', [ this.setting(setting, currentSetting) ]),
            m('a.btn.btn-info.ml-1', {onclick: () => this.default(plugin, setting, currentSetting)}, [
                m('img', { src: "./images/binoculars-fill.svg", width:"23", height:"23", title:"Auto default"}),
            ])
        ]);
    }

    setting(setting, currentSetting) {
        if(setting.type === 'hostFolder') {
            return m('input[type=text].form-control', {
                name: setting.name,
                value: currentSetting.value.folder,
                onchange: (event) => { this.settingChanged(event, currentSetting) },
            });
        }
    }

    settingChanged(event, currentSetting) {
        currentSetting.value = event.target.value;
    }

    default(plugin, setting, currentSetting) {
        m.request({method: "GET", url: `/setting/default?plugin=${plugin.name}&setting=${setting.name}`}).then((defaultValue) => {
            currentSetting.value = defaultValue.value;
        });
    }
}
