import "./globals.d.ts";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";

import "../src/services/BaseDirService";
import "vitest-fetch-mock";

const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
