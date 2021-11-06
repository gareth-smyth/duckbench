import Setting from './Setting.js';

export default class Settings {
    view(node) {
        return node.attrs.settings.map(plugin => {
            if(!node.attrs.currentSettings[plugin.name]) {
                node.attrs.currentSettings[plugin.name] = [];
            }
            const currentSettings = node.attrs.currentSettings[plugin.name];
            return [
                m('.container', [ m('.row', [
                    m('h4.col-9.my-auto', plugin.label),
                    m('a.btn.btn-info.ml-3.my-auto.col-1', {'data-toggle': 'collapse', 'data-target': `#setting_${plugin.name}`}, [
                        m('img', { src: "./images/gear-fill.svg", width:"23", height:"23", title:"Configure"}),
                    ]),
                ])]),
                m('.mt-2', [
                    ...plugin.settings.map(setting => {
                        let currentSetting = currentSettings.find(currentSetting => currentSetting.name === setting.name);
                        if(!currentSetting) {
                            currentSetting = {
                                name: setting.name,
                                value: '',
                            }
                            currentSettings.push(currentSetting);
                        }
                        return m('.container-fluid.collapse', {id: `setting_${plugin.name}`}, [m(Setting, {plugin, setting, currentSetting})]);
                })]),
            ];
        });
    }
}
