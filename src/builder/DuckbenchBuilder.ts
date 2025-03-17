import { PluginConfig, Settings } from "../types";
import Logger from "../services/LoggerService";
import Runner from "./Runner";
import EnvironmentSetup from "./EnvironmentSetup";
import WinUAEEnvironment from "./WinUAEEnvironment";
import Communicator from "./Communicator";

export default class DuckbenchBuilder {
  async build(config: PluginConfig[], settings: Settings) {
    const environmentSetup = new EnvironmentSetup();
    let environment: WinUAEEnvironment | undefined = undefined;
    const communicator = new Communicator();

    const runner = new Runner();
    try {
      await runner.configureAndSetup(config);
      runner.validate(environmentSetup, settings);
      await runner.prepare(environmentSetup, settings);
      environment = new WinUAEEnvironment(environmentSetup, settings);
      await this.executeBuild(
        environment,
        environmentSetup,
        settings,
        communicator,
        runner,
      );
    } catch (err) {
      Logger.trace(err);
      throw err;
    } finally {
      communicator.close();
      environment?.stop();
      environmentSetup.destroy();
      Logger.info("Build complete.");
    }
  }

  async executeBuild(
    environment: WinUAEEnvironment,
    environmentSetup: EnvironmentSetup,
    settings: Settings,
    communicator: Communicator,
    runner: Runner,
  ) {
    environment.start();
    await this.sleep(5000);
    await communicator.connect();

    await runner.install(communicator, environmentSetup, settings);

    communicator.close();

    Logger.info("Pausing before shutting down the emulator.");
    await this.sleep(10000);
    environment.stop();

    Logger.info("Pausing to let the emulator shutdown.");
    await this.sleep(1000);

    await runner.finalise(environmentSetup, settings);

    return environment;
  }

  /* istanbul ignore next */
  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
