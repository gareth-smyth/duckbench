require('./src/services/BaseDirService');
require('./src/services/LoggerService');

let configurator;

try {
    Logger.level = 'debug';
    const Configurator = require('./src/configurator/Configurator');
    configurator = new Configurator();
    configurator.start();
} catch (error) {
    Logger.error(error.message);
    Logger.trace(error);
}
