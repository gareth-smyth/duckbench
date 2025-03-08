import {Logger} from 'pino';

declare global {
    var Logger: Logger;
    var CACHE_DIR: string;
    var BASE_DIR: string;
    var TOOLS_DIR: string;
}

export {};
