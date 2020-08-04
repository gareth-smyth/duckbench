import HostFolder from './HostFolder.js';
import HostFile from './HostFile.js';

export default class Setting {
    view(node) {
        const plugin = node.attrs.plugin;
        const setting = node.attrs.setting;
        const currentSetting = node.attrs.currentSetting;

        let showCached = false;
        if(setting.cached) {
            showCached = true;
        }
        let showNotCached = false;
        if(setting.cached === false) {
            showNotCached = true;
        }

        return m('.form-group.row', [
            m('.col-2', [m('label.col-form-label.option-label.text-nowrap.text-right', setting.label)]),
            m('.col-8', [ this.setting(setting, currentSetting) ]),
            setting.hasDefaultSearch ? m('.col-1', [m('a.btn.btn-info', {onclick: () => this.default(plugin, setting, currentSetting)}, [
                m('img', { src: "./images/binoculars-fill.svg", width:"23", height:"23", title:"Auto default"}),
            ])]) : m('.col-1'),
            showCached ? m('.col-1.my-auto', [
                m('img', { src: "./images/archive-fill.svg", width:"23", height:"23", title:"Cached"}),
            ]) : '',
            showNotCached ? m('.col-1.my-auto', [
                m('img', { src: "./images/archive.svg", width:"23", height:"23", title:"Not cached"}),
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
