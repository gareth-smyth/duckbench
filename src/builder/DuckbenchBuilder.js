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
            environment.stop();
            return new Promise((resolve, reject) => setTimeout(() => {
                runner.finalise(environmentSetup).then(() => {
                    environmentSetup.destroy();
                    resolve();
                }).catch((err) => {
                    Logger.error('Could not shut down properly');
                    reject(err);
                });
            }, 1000));
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
        });
    }
}

module.exports = DuckbenchBuilder;
