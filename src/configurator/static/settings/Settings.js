import Setting from './Setting.js';

export default class Settings {
    view(node) {
        return node.attrs.settings.map(plugin => {
            if(!node.attrs.currentSettings[plugin.name]) {
                node.attrs.currentSettings[plugin.name] = [];
            }
            const currentSettings = node.attrs.currentSettings[plugin.name];
            return [
                m('.h4', plugin.name),
                ...plugin.settings.map(setting => {
                    let currentSetting = currentSettings.find(currentSetting => currentSetting.name === setting.name);
                    if(!currentSetting) {
                        currentSetting = {
                            name: setting.name,
                            value: '',
                        }
                        currentSettings.push(currentSetting);
                    }
                    return m(Setting, {plugin, setting, currentSetting})
                }),
            ];
        });
    }
}
