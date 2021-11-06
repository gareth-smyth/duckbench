const Runner = require('./Runner');
const EnvironmentSetup = require('./EnvironmentSetup');

class DuckbenchBuilder {
    constructor() {
        this.environment = undefined;
        this.communicator = undefined;
    }

    async build(config, Environment, Communicator, settings) {
        const environmentSetup = new EnvironmentSetup(settings);

        const runner = new Runner();
        try {
            runner.configureAndSetup({name: 'Setup'}, config);
            runner.validate(environmentSetup, settings);
            await runner.prepare(environmentSetup, settings);
            await this.executeBuild(Environment, environmentSetup, settings, Communicator, runner);
        } catch (err) {
            Logger.trace(err);
            throw err;
        } finally {
            if (this.communicator) {
                this.communicator.close();
            }
            if (this.environment) {
                this.environment.stop();
            }
            environmentSetup.destroy();
            Logger.info('Build complete.');
        }
    };

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

module.exports = DuckbenchBuilder;
