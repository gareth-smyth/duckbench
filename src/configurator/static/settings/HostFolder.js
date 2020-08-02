export default class HostFolder {
    view(node) {
        const setting = node.attrs.setting;
        const currentSetting = node.attrs.currentSetting;
        return m('input[type=text].form-control', {
            name: setting.name,
            value: currentSetting.value.folder,
            onchange: (event) => { this.settingChanged(event, currentSetting) },
        });
    }

    settingChanged(event, currentSetting) {
        currentSetting.value = { folder: event.target.value };
    }
}
