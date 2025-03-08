import * as BaseDirService from './src/services/BaseDirService';
import * as LoggerService from './src/services/LoggerService';

try {
    global.Logger.level = 'debug';
    const Configurator = (await import('./src/configurator/Configurator')).default;
    const configurator = new Configurator();
    configurator.start();
} catch (error) {
    global.Logger.error(error.message);
    global.Logger.trace(error);
}
