import './services/BaseDirService.js';
import './services/LoggerService.js';
import Configurator  from './configurator/Configurator.js';

try {
    global.Logger.level = 'trace';
    const configurator = new Configurator();
    configurator.start();
} catch (error) {
    if(error && typeof error === 'object' && "message" in error) {
        global.Logger.error(error.message);
        global.Logger.trace(error);
    } else {
        global.Logger.error(error);
    }
}
