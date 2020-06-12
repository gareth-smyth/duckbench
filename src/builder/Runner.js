const PluginStore = require('./PluginStore');

class Runner {
    constructor() {
        this.configs = [];
        this.pluginStore = new PluginStore();
    }

    configureAndSetup(setupConfig, configs) {
        this.setupConfig = setupConfig;
        this.setupPlugin = this.pluginStore.create(setupConfig.name);
        this.pluginStore.add(setupConfig.name, this.setupPlugin);
        this.configure(configs);
    }

    configure(configs) {
        configs.forEach((config) => {
            if (!this.pluginStore.hasPlugin(config.name)) {
                const plugin = this.pluginStore.create(config.name);
                const childConfigs = plugin.configure && plugin.configure(config);
                if (childConfigs) {
                    this.configure(childConfigs);
                }
                this.pluginStore.add(config.name, plugin);
            }
            this.configs.push(config);
        });
    }

    async prepare(environmentSetup) {
        for (let configIndex = 0; configIndex < this.configs.length; configIndex++) {
            const config = this.configs[configIndex];
            const plugin = this.pluginStore.getPlugin(config.name);
            if (plugin.prepare) {
                await plugin.prepare(config, environmentSetup);
            }
        }
        await this.setupPlugin.prepare(this.setupConfig, environmentSetup);
    }

    async install(communicator, environmentSetup) {
        await this.setupPlugin.install(this.setupConfig, communicator, this.pluginStore, environmentSetup);
        for (let configIndex = 0; configIndex < this.configs.length; configIndex++) {
            const config = this.configs[configIndex];
            const plugin = this.pluginStore.getPlugin(config.name);
            if (plugin.install) {
                await plugin.install(config, communicator, this.pluginStore, environmentSetup);
            }
        }
    }

    async finalise(environmentSetup) {
        for (let configIndex = 0; configIndex < this.configs.length; configIndex++) {
            const config = this.configs[configIndex];
            const plugin = this.pluginStore.getPlugin(config.name);
            if (plugin.finalise) {
                await plugin.finalise(config, environmentSetup);
            }
        }
    }
}

module.exports = Runner;
