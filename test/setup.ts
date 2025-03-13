import "./globals.d.ts";
import createFetchMock from "vitest-fetch-mock";
import { vi } from "vitest";

import "../src/services/BaseDirService";
import "vitest-fetch-mock";

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal();
  const fakeFs = {
    // @ts-expect-error Spread operator usage
    ...actual,
    chmodSync: vi.fn(),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    rmdirSync: vi.fn(),
    unlinkSync: vi.fn(),
    writeFileSync: vi.fn(),
    writeSync: vi.fn(),
  };
  return {
    // @ts-expect-error Spread operator usage
    ...actual,
    default: fakeFs,
    ...fakeFs,
  };
});
const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
