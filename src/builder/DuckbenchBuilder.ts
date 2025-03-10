import Runner from './Runner.js';
import EnvironmentSetup from './EnvironmentSetup.js';
import WinUAEEnvironment from "./WinUAEEnvironment.js";
import Communicator from "./Communicator.js";

export type PluginConfig = {
    type?: string,
    id: string,
    name: string,
    optionValues: Record<string, string>;
}

type Settings = Record<string, Array<Record<string, string>>>;

export default class DuckbenchBuilder {
    async build(config: PluginConfig[], settings: Settings) {
        const environmentSetup = new EnvironmentSetup();
        const environment = new WinUAEEnvironment(environmentSetup, settings);
        const communicator = new Communicator();

        const runner = new Runner();
        try {
            await runner.configureAndSetup({name: 'Setup'}, config);
            runner.validate(environmentSetup, settings);
            await runner.prepare(environmentSetup, settings);
            await this.executeBuild(environment, environmentSetup, settings, communicator, runner);
        } catch (err) {
            global.Logger.trace(err);
            throw err;
        } finally {
            communicator.close();
            environment.stop();
            environmentSetup.destroy();
            global.Logger.info('Build complete.');
        }
    };

    async executeBuild(environment: WinUAEEnvironment, environmentSetup: EnvironmentSetup, settings: Settings, communicator: Communicator, runner: Runner) {
        environment.start();
        await this.sleep(5000);
        await communicator.connect();

        await runner.install(communicator, environmentSetup, settings);

        communicator.close();

        global.Logger.info('Pausing before shutting down the emulator.');
        await this.sleep(20000);
        environment.stop();

        global.Logger.info('Pausing to let the emulator shutdown.');
        await this.sleep(1000);

        await runner.finalise(environmentSetup);
    }

    /* istanbul ignore next */
    async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
