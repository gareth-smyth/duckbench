import {Logger} from 'pino';

declare global {
    var Logger: Logger;
    var CACHE_DIR: string;
}

export {};
