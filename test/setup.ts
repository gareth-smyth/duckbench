import {Logger} from "pino";
import '../src/services/BaseDirService.js'

global.Logger = {
    info: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    silent: vi.fn(),
} as unknown as Logger;
global.CACHE_DIR = 'MyCacheDir:'
