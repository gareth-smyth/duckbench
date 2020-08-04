const fs = require('fs');
const path = require('path');

class SettingsService {
    static async getAvailable() {
        const pluginPath = path.join(__dirname, '../', 'plugins');
        const pluginsDir = fs.opendirSync(pluginPath);
        const plugins = [];
        let directoryEntry;
        while ((directoryEntry = pluginsDir.readSync()) !== null) {
            plugins.push(directoryEntry);
        }
        plugins.sort();
        await pluginsDir.close();
        const settings = await Promise.all(
            plugins.filter((pluginDir) => pluginDir.isDirectory()).map(async (pluginDir) => {
                let PluginSettings;

                try {
                    PluginSettings = require(path.join(pluginPath, pluginDir.name, 'settings'));
                } catch (error) {
                /* istanbul ignore else */
                    if (error.code === 'MODULE_NOT_FOUND') {
                        Logger.trace(`No settings for ${pluginDir.name}`);
                        return Promise.resolve(undefined);
                    } else {
                        Logger.error(`No settings for ${pluginDir.name}`);
                        throw new Error(`Could not load settings for plugin ${pluginDir.name} even though it exists.`);
                    }
                }

                Logger.trace(`Loading settings for ${pluginDir.name}`);
                const pluginSettings = new PluginSettings();
                return pluginSettings.get();
            }),
        );

        /* Only two plugins have settings as yet and tests use real plugins so can't sort fully */
        /* istanbul ignore next */
        return settings.filter((settings) => settings !== undefined)
            .sort((plugin1, plugin2) => {
                if (plugin1.name === 'Setup') return -1;
                if (plugin2.name === 'Setup') return 1;
                return 0;
            });
    }


    static loadCurrent() {
        const settingsPath = path.join(global.BASE_DIR, 'db_settings.json');
        if (fs.existsSync(settingsPath)) {
            return JSON.parse(fs.readFileSync(settingsPath).toString());
        }

        return {};
    }

    static saveCurrent(settings) {
        const settingsPath = path.join(global.BASE_DIR, 'db_settings.json');
        fs.writeFileSync(settingsPath, JSON.stringify(settings));
    }

    static async getDefault(pluginName, settingName) {
        const pluginPath = path.join(__dirname, '../', 'plugins');
        const PluginSettings = require(path.join(pluginPath, pluginName, 'settings'));
        const settings = new PluginSettings();

        if (settings.default) {
            return {value: settings.default(settingName)};
        }
    }
}

module.exports = SettingsService;
