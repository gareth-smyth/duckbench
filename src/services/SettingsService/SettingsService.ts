import fs from "fs";
import path from "path";
import Logger from "../LoggerService.js";
import { BASE_DIR } from "../BaseDirService.js";
import { Settings } from "../../types";

export default class SettingsService {
  static async getAvailable() {
    const pluginPath = path.join(import.meta.dirname, "../../", "plugins");
    const pluginsDir = fs.opendirSync(pluginPath);
    const plugins = [];
    let directoryEntry;
    while ((directoryEntry = pluginsDir.readSync()) !== null) {
      plugins.push(directoryEntry);
    }
    plugins.sort();
    await pluginsDir.close();
    const settings = await Promise.all(
      plugins
        .filter((pluginDir) => pluginDir.isDirectory())
        .map(async (pluginDir) => {
          let settingsFile = "";
          const settingsFileTs = path.join(
            pluginPath,
            pluginDir.name,
            "settings.ts",
          );
          const settingsFileJs = path.join(
            pluginPath,
            pluginDir.name,
            "settings.js",
          );

          /* istanbul ignore else @preserve */
          if (
            !fs.existsSync(settingsFileTs) &&
            !fs.existsSync(settingsFileJs)
          ) {
            return Promise.resolve(undefined);
          } else if (fs.existsSync(settingsFileTs)) {
            settingsFile = settingsFileTs;
          } else if (fs.existsSync(settingsFileJs)) {
            settingsFile = settingsFileJs;
          }

          const PluginSettings = (await import(settingsFile)).default;
          Logger.trace(`Loading settings for ${pluginDir.name}`);
          const pluginSettings = new PluginSettings();
          return pluginSettings.get();
        }),
    );

    /* Only two plugins have settings as yet and tests use real plugins so can't test sort fully */
    /* istanbul ignore next @preserve */
    return settings
      .filter((settings) => settings !== undefined)
      .sort((plugin1, plugin2) => {
        if (plugin1.name === "Setup") return -1;
        if (plugin2.name === "Setup") return 1;
        return 0;
      });
  }

  static loadCurrent() {
    const settingsPath = path.join(BASE_DIR, "db_settings.json");
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath).toString());
    }

    return {};
  }

  static saveCurrent(settings: Settings) {
    const settingsPath = path.join(BASE_DIR, "db_settings.json");
    fs.writeFileSync(settingsPath, JSON.stringify(settings));
  }

  static async getDefault(pluginName: string, settingName: string) {
    const pluginPath = path.join(import.meta.dirname, "../../", "plugins");
    const PluginSettings = (
      await import(path.join(pluginPath, pluginName, "settings.js"))
    ).default;
    const settings = new PluginSettings();

    if (settings.default) {
      return { value: await settings.default(settingName) };
    }

    return undefined;
  }

  static getValue(settings: Settings, pluginName: string, settingName: string) {
    return settings[pluginName].find((setting) => setting.name === settingName)!
      .value;
  }

  static getValueIfDefined(
    settings: Settings,
    pluginName: string,
    settingName: string,
  ) {
    return settings[pluginName].find((setting) => setting.name === settingName)
      ?.value;
  }
}
