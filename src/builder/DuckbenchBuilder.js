const duckbenchConfig = require('./duckbench.config');
const Runner = require('./Runner');
const EnvironmentSetup = require('./EnvironmentSetup');

class DuckbenchBuilder {
    async build(config, Environment, Communicator) {
        const setUpConfig = {name: 'Setup'};

        let communicator;
        let environment;
        const environmentSetup = new EnvironmentSetup(duckbenchConfig);

        const runner = new Runner(duckbenchConfig);
        runner.configureAndSetup(setUpConfig, config);
        return runner.prepare(environmentSetup).then(async () => {
            environment = new Environment(duckbenchConfig, environmentSetup);
            environment.start();
            communicator = new Communicator();
            await communicator.connect();

            await runner.install(communicator, environmentSetup);

            communicator.close();

            Logger.info('Pausing before shutting down the emulator.');
            await this.sleep(20000);
            environment.stop();

            Logger.info('Pausing to let the emulator shutdown.');
            await this.sleep(1000);

            await runner.finalise(environmentSetup);
        }).catch((err) => {
            Logger.trace(err);
            throw err;
        }).finally(async () => {
            if (communicator) {
                communicator.close();
            }
            if (environment) {
                environment.stop();
            }
            environmentSetup.destroy();
            Logger.info('Build complete.');
        });
    }

    /* istanbul ignore next */
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

module.exports = DuckbenchBuilder;
