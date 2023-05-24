/* istanbul ignore file */
const pino = require('pino');
const log = pino({
    transport: {
        target: 'pino-pretty',
    },
});
log.level = 'trace';
global.Logger = log;
