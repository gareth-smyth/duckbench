import fs from "fs";
import path from "path";
import type { Plugin } from "../types";

export default class PluginStore {
  private readonly plugins: Record<string, Plugin> = {};

  static async getStructures() {
    const pluginPath = path.join(import.meta.dirname, "../", "plugins");
    const pluginsDir = fs.opendirSync(pluginPath);
    const plugins = [];
    let directoryEntry;
    while ((directoryEntry = pluginsDir.readSync()) !== null) {
      plugins.push(directoryEntry);
    }
    plugins.sort();
    await pluginsDir.close();
    return Promise.all(
      plugins
        .filter((pluginDir) => pluginDir.isDirectory())
        .map(async (pluginDir) => {
          const Plugin = (
            await import(path.join(pluginPath, pluginDir.name, "index.js"))
          ).default;
          console.log(Plugin);
          const plugin = new Plugin();
          return plugin.structure();
        }),
    );
  }

  async create(pluginName: string) {
    const Plugin = (
      await import(path.join(`../plugins/${pluginName}`, "index.js"))
    ).default;
    return new Plugin();
  }

  add(pluginName: string, plugin: Plugin) {
    this.plugins[pluginName.toLocaleLowerCase()] = plugin;
  }

  hasPlugin(pluginName: string) {
    return !!this.plugins[pluginName.toLocaleLowerCase()];
  }

  getPlugin(pluginName: string) {
    return this.plugins[pluginName.toLocaleLowerCase()];
  }
}
