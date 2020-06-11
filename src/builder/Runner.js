const PluginStore = require('./PluginStore');

class Runner {
    constructor() {
        this.configs = [];
        this.pluginStore = new PluginStore();
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
    }

    async install(communicator, environmentSetup) {
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
