import PluginStore from "./PluginStore";
import ValidationError from "../errors/ValidationError.js";
import type { Plugin, PluginConfig, Settings } from "../types";
import EnvironmentSetup from "./EnvironmentSetup";
import Communicator from "./Communicator";
import SetupPlugin, { SetupPluginConfig } from "../plugins/Setup";

export default class Runner {
  private readonly pluginStore: PluginStore = new PluginStore();
  configs: PluginConfig[] = [];
  setupConfig: SetupPluginConfig = { name: "Setup", type: "internal" };
  setupPlugin?: SetupPlugin;

  async configureAndSetup(configs: PluginConfig[]) {
    this.setupPlugin = await this.pluginStore.create(this.setupConfig.name);
    this.pluginStore.add(
      this.setupConfig.name,
      this.setupPlugin as Plugin<PluginConfig>,
    );
    await this.configure(configs);
  }

  async configure(configs: PluginConfig[]) {
    for (const config of configs) {
      if (!this.pluginStore.hasPlugin(config.name)) {
        const plugin = await this.pluginStore.create(config.name);
        const childConfigs = plugin.configure && plugin.configure(config);
        if (childConfigs) {
          await this.configure(childConfigs);
        }
        this.pluginStore.add(config.name, plugin);
      }
      this.configs.push(config);
    }
  }

  validate(environmentSetup: EnvironmentSetup, settings: Settings) {
    if (!this.setupPlugin) {
      throw Error("configureAndSetup must be called before validate");
    }

    const validationErrors = this.setupPlugin.validate!(
      this.setupConfig,
      environmentSetup,
      settings,
    );

    this.configs.map((config) => {
      const plugin = this.pluginStore.getPlugin(config.name);
      if (plugin.validate) {
        validationErrors.push(
          ...plugin.validate(config, environmentSetup, settings),
        );
      }
    });

    if (validationErrors.length) {
      throw new ValidationError(validationErrors);
    }
  }

  async prepare(environmentSetup: EnvironmentSetup, settings: Settings) {
    for (
      let configIndex = 0;
      configIndex < this.configs.length;
      configIndex++
    ) {
      const config = this.configs[configIndex];
      const plugin = this.pluginStore.getPlugin(config.name);
      if (plugin.prepare) {
        await plugin.prepare(config, environmentSetup, settings);
      }
    }
    await this.setupPlugin?.prepare(
      this.setupConfig,
      environmentSetup,
      settings,
    );
  }

  async install(
    communicator: Communicator,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
  ) {
    await this.setupPlugin?.install(
      this.setupConfig,
      communicator,
      this.pluginStore,
    );
    for (
      let configIndex = 0;
      configIndex < this.configs.length;
      configIndex++
    ) {
      const config = this.configs[configIndex];
      const plugin = this.pluginStore.getPlugin(config.name);
      if (plugin.install) {
        await plugin.install(
          config,
          communicator,
          this.pluginStore,
          environmentSetup,
          settings,
        );
      }
    }
  }

  async finalise(environmentSetup: EnvironmentSetup) {
    for (
      let configIndex = 0;
      configIndex < this.configs.length;
      configIndex++
    ) {
      const config = this.configs[configIndex];
      const plugin = this.pluginStore.getPlugin(config.name);
      if (plugin.finalise) {
        await plugin.finalise(config, environmentSetup);
      }
    }
  }
}
