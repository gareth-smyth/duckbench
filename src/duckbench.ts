import "./services/BaseDirService";
import Configurator from "./configurator/Configurator";
import Logger from "./services/LoggerService";

try {
  Logger.level = "trace";
  const configurator = new Configurator();
  configurator.start();
} catch (error) {
  if (error && typeof error === "object" && "message" in error) {
    Logger.error(error.message);
    Logger.trace(error);
  } else {
    Logger.error(error);
  }
}
