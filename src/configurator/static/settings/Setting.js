import HostFolder from './HostFolder.js';
import HostFile from './HostFile.js';

export default class Setting {
    view(node) {
        const plugin = node.attrs.plugin;
        const setting = node.attrs.setting;
        const currentSetting = node.attrs.currentSetting;
        return m('.form-group row', [
            m('label.col-sm-3.col-form-label.option-label.text-nowrap.text-right', setting.label),
            m('.col-sm-8', [ this.setting(setting, currentSetting) ]),
            setting.hasDefaultSearch ? m('a.btn.btn-info.ml-1', {onclick: () => this.default(plugin, setting, currentSetting)}, [
                m('img', { src: "./images/binoculars-fill.svg", width:"23", height:"23", title:"Auto default"}),
            ]) : '',
        ]);
    }

    setting(setting, currentSetting) {
        if(setting.type === 'hostFolder') {
            return m(HostFolder, { setting, currentSetting });
        } else if(setting.type === 'hostFile') {
            return m(HostFile, { setting, currentSetting });
        }
    }

    default(plugin, setting, currentSetting) {
        m.request({method: "GET", url: `/setting/default?plugin=${plugin.name}&setting=${setting.name}`}).then((defaultValue) => {
            currentSetting.value = defaultValue.value;
        });
    }
}
