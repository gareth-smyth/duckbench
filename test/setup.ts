import "./globals.d.ts";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";
import "vitest-fetch-mock";

vi.mock("node:fs", async () => {
  const fakeFs = {
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
    openSync: vi.fn(),
    closeSync: vi.fn(),
    chmodSync: vi.fn(),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    rmdirSync: vi.fn(),
    unlinkSync: vi.fn(),
    writeFileSync: vi.fn(),
    writeSync: vi.fn(),
  };
  return {
    default: fakeFs,
    ...fakeFs,
  };
});

import "../src/services/BaseDirService";
const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
