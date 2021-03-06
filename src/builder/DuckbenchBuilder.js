const Runner = require('./Runner');
const EnvironmentSetup = require('./EnvironmentSetup');

class DuckbenchBuilder {
    async build(config, Environment, Communicator, settings) {
        let communicator;
        let environment;
        const environmentSetup = new EnvironmentSetup(settings);

        const runner = new Runner();
        runner.configureAndSetup({name: 'Setup'}, config);
        return runner.prepare(environmentSetup, settings).then(async () => {
            environment = new Environment(environmentSetup, settings);
            environment.start();
            await this.sleep(5000);
            communicator = new Communicator();
            await communicator.connect();

            await runner.install(communicator, environmentSetup, settings);

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
