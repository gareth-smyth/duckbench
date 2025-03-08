import {Logger} from "pino";
import {} from '../src/services/BaseDirService'

global.Logger = {
    info: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    silent: jest.fn(),
} as unknown as Logger;
global.CACHE_DIR = 'MyCacheDir:'
global.CACHE_DIR = 'MyCacheDir:'

