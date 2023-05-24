const {workerData} = require('worker_threads');
require('../services/BaseDirService');
require('../services/LoggerService');

const Communicator = require('../builder/Communicator');
const WinUAEEnvironment = require('../builder/WinUAEEnvironment');
const Runner = require('./Runner');
const EnvironmentSetup = require('./EnvironmentSetup');

class DuckbenchBuilder {
    build(config, Environment, Communicator, settings) {
        try {
            this.envSetup = new EnvironmentSetup(settings);
            const runner = new Runner();
            runner.configureAndSetup({name: 'Setup'}, config);
            runner.validate(this.envSetup, settings);
            return runner.prepare(this.envSetup, settings).then(() => {
                return this.executeBuild(Environment, this.envSetup, settings, Communicator, runner).then(() => {
                    this.shutdown(this.envSetup);
                }).catch((err) => {
                    this.shutdown(this.envSetup);
                    Logger.trace(err);
                });
            }).catch((err) => {
                this.shutdown(this.envSetup);
                Logger.trace(err);
            });
        } catch (err) {
            this.shutdown(this.envSetup);
            Logger.trace(err);
            throw err;
        }
    };

    shutdown(environmentSetup) {
        if (this.communicator) {
            this.communicator.close();
        }
        if (this.environment) {
            this.environment.stop();
        }
        if (this.envSetup) {
            environmentSetup.destroy();
        }
        Logger.info('Build complete.');
    }

    async executeBuild(Environment, environmentSetup, settings, Communicator, runner) {
        this.environment = new Environment(environmentSetup, settings);
        this.environment.start();
        await this.sleep(5000);
        this.communicator = new Communicator();
        await this.communicator.connect();

        await runner.install(this.communicator, environmentSetup, settings);

        this.communicator.close();

        Logger.info('Pausing before shutting down the emulator.');
        await this.sleep(20000);
        this.environment.stop();

        Logger.info('Pausing to let the emulator shutdown.');
        await this.sleep(1000);

        await runner.finalise(environmentSetup);
    }

    /* istanbul ignore next */
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

try {
    const duckbenchBuilder = new DuckbenchBuilder();
    return duckbenchBuilder.build(workerData.config, WinUAEEnvironment, Communicator, workerData.settings);
} catch (error) {
    Logger.error(error);
    throw error;
}
