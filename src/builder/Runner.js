const PluginStore = require('./PluginStore');
const ValidationError = require('../errors/ValidationError');
const ProgressService = require('../services/ProgressService');

class Runner {
    constructor() {
        this.configs = [];
        this.pluginStore = new PluginStore();
        this.progress = new ProgressService();
        this.progress.setExpectations('Running builder', 10000);
    }

    configureAndSetup(setupConfig, configs) {
        this.progress.start();
        this.setupConfig = setupConfig;
        this.setupConfig.progress = this.progress.addChild();
        this.setupPlugin = this.pluginStore.create(setupConfig.name);
        this.pluginStore.add(setupConfig.name, this.setupPlugin);
        this.configure(configs, this.progress);
    }

    configure(configs, progress) {
        configs.forEach((config) => {
            config.progress = progress.addChild();
            if (!this.pluginStore.hasPlugin(config.name)) {
                const plugin = this.pluginStore.create(config.name);
                const childConfigs = plugin.configure && plugin.configure(config);
                if (childConfigs) {
                    this.configure(childConfigs, config.progress);
                }
                this.pluginStore.add(config.name, plugin);
            }
            this.configs.push(config);
        });
    }

    validate(environmentSetup, settings) {
        const validationErrors = [];
        validationErrors.push(...this.setupPlugin.validate(this.setupConfig, environmentSetup, settings));

        this.configs.map((config) => {
            const plugin = this.pluginStore.getPlugin(config.name);
            if (plugin.validate) {
                validationErrors.push(...plugin.validate(config, environmentSetup, settings));
            }
        });

        if (validationErrors.length) {
            throw new ValidationError(validationErrors);
        }
    }

    async prepare(environmentSetup, settings) {
        for (let configIndex = 0; configIndex < this.configs.length; configIndex++) {
            const config = this.configs[configIndex];
            const plugin = this.pluginStore.getPlugin(config.name);
            if (plugin.prepare) {
                await plugin.prepare(config, environmentSetup, settings);
            }
        }
        await this.setupPlugin.prepare(this.setupConfig, environmentSetup, settings);
    }

    async install(communicator, environmentSetup, settings) {
        await this.setupPlugin.install(this.setupConfig, communicator, this.pluginStore, environmentSetup, settings);
        for (let configIndex = 0; configIndex < this.configs.length; configIndex++) {
            const config = this.configs[configIndex];
            const plugin = this.pluginStore.getPlugin(config.name);
            if (plugin.install) {
                await plugin.install(config, communicator, this.pluginStore, environmentSetup, settings);
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
        this.progress.progress(100);
    }
}

module.exports = Runner;
