import { Logger } from "pino";
import "../src/globals.d.ts";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";

import "../src/services/BaseDirService.js";
import "vitest-fetch-mock";

global.Logger = {
  info: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  silent: vi.fn(),
} as unknown as Logger;
global.CACHE_DIR = "MyCacheDir:";

const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
