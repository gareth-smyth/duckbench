import "../src/globals.d.ts";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";

import "../src/services/BaseDirService.js";
import "vitest-fetch-mock";

global.CACHE_DIR = "MyCacheDir:";

const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
